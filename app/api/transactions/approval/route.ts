import { NextResponse } from "next/server";
import { TransactionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin } from "@/lib/server-auth";
import { requireFinance } from "@/lib/server-rbac";
import { postApprovedPayment, FinancialPostingError } from "@/lib/financial-posting";
import { parseJsonObject, requireText } from "@/lib/validation";

export const dynamic = "force-dynamic";

function serializeTransaction<T extends { amountMinor: bigint; feeMinor: bigint }>(transaction: T) {
  return {
    ...transaction,
    amountMinor: transaction.amountMinor.toString(),
    feeMinor: transaction.feeMinor.toString(),
  };
}

function errorStatus(error: unknown) {
  if (error instanceof FinancialPostingError) return error.status;
  const message = error instanceof Error ? error.message : "Request failed.";
  if (message === "Authentication is required.") return 401;
  if (message.includes("not authorized") || message.includes("role is not permitted")) return 403;
  return 400;
}

export async function POST(request: Request) {
  try {
    assertSameOrigin();
    const actor = await requireFinance();
    const body = parseJsonObject(await request.json());
    const transactionId = requireText(body.transactionId, "transactionId", 128);
    const decision = requireText(body.decision, "decision", 16).toUpperCase();
    const reason = body.reason === undefined ? undefined : requireText(body.reason, "reason", 512);

    if (decision !== "APPROVE" && decision !== "REJECT") {
      throw new Error("Decision must be APPROVE or REJECT.");
    }

    const payment = await prisma.paymentTransaction.findUnique({ where: { id: transactionId } });
    if (!payment) return NextResponse.json({ error: "Transaction was not found." }, { status: 404 });

    if (payment.status !== TransactionStatus.AWAITING_APPROVAL) {
      return NextResponse.json({ error: "Only awaiting-approval transactions can be reviewed." }, { status: 409 });
    }

    if (decision === "REJECT") {
      const rejected = await prisma.$transaction(async (tx) => {
        const updated = await tx.paymentTransaction.update({
          where: { id: payment.id, status: TransactionStatus.AWAITING_APPROVAL },
          data: { status: TransactionStatus.CANCELLED, failureReason: reason ?? "Rejected by finance." },
        });
        await tx.auditEvent.create({
          data: {
            userId: actor.id,
            action: "PAYMENT_REJECTED",
            target: payment.id,
            metadata: { reason: reason ?? "Rejected by finance." },
          },
        });
        return updated;
      });
      return NextResponse.json({ ok: true, transaction: serializeTransaction(rejected) });
    }

    const approved = await postApprovedPayment(payment.id, actor.id);
    return NextResponse.json({ ok: true, transaction: serializeTransaction(approved) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to review transaction.";
    return NextResponse.json({ error: message }, { status: errorStatus(error) });
  }
}
