import { NextResponse } from "next/server";
import { TransactionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin } from "@/lib/server-auth";
import { requireFinance } from "@/lib/server-rbac";
import { postApprovedPayment, FinancialPostingError } from "@/lib/financial-posting";
import { gateTransaction } from "@/lib/transaction-gate";
import { parseJsonObject, requireText } from "@/lib/validation";

export const dynamic = "force-dynamic";

function serializeTransaction<T extends { amountMinor: bigint; feeMinor: bigint }>(transaction: T) {
  return { ...transaction, amountMinor: transaction.amountMinor.toString(), feeMinor: transaction.feeMinor.toString() };
}

function errorStatus(error: unknown) {
  if (error instanceof FinancialPostingError) return error.status;
  const message = error instanceof Error ? error.message : "Request failed.";
  if (message === "Authentication is required.") return 401;
  if (message.includes("not authorized") || message.includes("role is not permitted")) return 403;
  return 400;
}

export async function GET(request: Request) {
  try {
    const actor = await requireFinance();
    const url = new URL(request.url);
    const requestedStatus = url.searchParams.get("status")?.toUpperCase() || "AWAITING_APPROVAL";
    const allowedStatuses = new Set(Object.values(TransactionStatus));
    if (!allowedStatuses.has(requestedStatus as TransactionStatus)) return NextResponse.json({ error: "Invalid transaction status." }, { status: 400 });

    const page = Math.max(1, Number(url.searchParams.get("page") || "1") || 1);
    const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") || "20") || 20));
    const where = { status: requestedStatus as TransactionStatus };
    const [total, transactions] = await prisma.$transaction([
      prisma.paymentTransaction.count({ where }),
      prisma.paymentTransaction.findMany({
        where,
        orderBy: { createdAt: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          kind: true,
          status: true,
          amountMinor: true,
          feeMinor: true,
          currency: true,
          idempotencyKey: true,
          externalReference: true,
          failureReason: true,
          createdAt: true,
          updatedAt: true,
          user: { select: { id: true, email: true, complianceProfile: true } },
          account: { select: { id: true, assetCode: true, assetType: true, status: true } },
        },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      actorRole: actor.role,
      page,
      pageSize,
      total,
      hasNextPage: page * pageSize < total,
      transactions: transactions.map((transaction) => serializeTransaction(transaction)),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load approval queue.";
    return NextResponse.json({ error: message }, { status: errorStatus(error) });
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin();
    const actor = await requireFinance();
    const body = parseJsonObject(await request.json());
    const transactionId = requireText(body.transactionId, "transactionId", 128);
    const decision = requireText(body.decision, "decision", 16).toUpperCase();
    const reason = body.reason === undefined ? undefined : requireText(body.reason, "reason", 512);
    if (decision !== "APPROVE" && decision !== "REJECT") throw new Error("Decision must be APPROVE or REJECT.");

    const payment = await prisma.paymentTransaction.findUnique({ where: { id: transactionId } });
    if (!payment) return NextResponse.json({ error: "Transaction was not found." }, { status: 404 });
    if (payment.status !== TransactionStatus.AWAITING_APPROVAL) return NextResponse.json({ error: "Only awaiting-approval transactions can be reviewed." }, { status: 409 });

    if (decision === "REJECT") {
      const rejected = await prisma.$transaction(async (tx) => {
        const result = await tx.paymentTransaction.updateMany({ where: { id: payment.id, status: TransactionStatus.AWAITING_APPROVAL }, data: { status: TransactionStatus.CANCELLED, failureReason: reason ?? "Rejected by finance." } });
        if (result.count !== 1) throw new Error("Transaction state changed before rejection could be applied.");
        const updated = await tx.paymentTransaction.findUniqueOrThrow({ where: { id: payment.id } });
        await tx.auditEvent.create({ data: { userId: actor.id, action: "PAYMENT_REJECTED", target: payment.id, metadata: { reason: reason ?? "Rejected by finance." } } });
        return updated;
      });
      return NextResponse.json({ ok: true, transaction: serializeTransaction(rejected) });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const [profile, dailyVolume, recentAttempts, failedAttempts] = await Promise.all([
      prisma.complianceProfile.findUnique({ where: { userId: payment.userId } }),
      prisma.paymentTransaction.aggregate({ where: { userId: payment.userId, currency: payment.currency, kind: payment.kind, status: TransactionStatus.CONFIRMED, createdAt: { gte: startOfDay } }, _sum: { amountMinor: true } }),
      prisma.paymentTransaction.count({ where: { userId: payment.userId, createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } } }),
      prisma.paymentTransaction.count({ where: { userId: payment.userId, status: TransactionStatus.FAILED, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
    ]);

    const gate = gateTransaction({
      amountMinor: payment.amountMinor,
      currency: payment.currency,
      dailyVolumeMinor: dailyVolume._sum.amountMinor ?? 0n,
      dailyLimitMinor: 0n,
      recentAttempts,
      failedAttempts,
      destinationNew: false,
      profile: profile ? { userId: profile.userId, kyc: profile.kyc, kyb: profile.kyb, sanctions: profile.sanctions, pep: profile.pep, sourceOfFunds: profile.sourceOfFunds, riskTier: profile.riskTier } : undefined,
    });

    if (!gate.allowedToPost) {
      await prisma.auditEvent.create({ data: { userId: actor.id, action: "PAYMENT_POSTING_BLOCKED_BY_RISK_GATE", target: payment.id, metadata: { complianceDecision: gate.complianceDecision, riskDecision: gate.risk.decision, riskScore: gate.risk.score, reason: gate.reason, signals: gate.risk.signals } } });
      return NextResponse.json({ error: "Transaction cannot be posted until the compliance and risk gates allow it.", gate: { complianceDecision: gate.complianceDecision, riskDecision: gate.risk.decision, riskScore: gate.risk.score, reason: gate.reason, signals: gate.risk.signals } }, { status: 409 });
    }

    const approved = await postApprovedPayment(payment.id, actor.id);
    return NextResponse.json({ ok: true, transaction: serializeTransaction(approved), gate });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to review transaction.";
    return NextResponse.json({ error: message }, { status: errorStatus(error) });
  }
}
