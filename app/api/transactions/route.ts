import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser } from "@/lib/server-rbac";
import { parseJsonObject, requireIdempotencyKey, requirePositiveMinorUnit, requireText } from "@/lib/validation";

export const dynamic = "force-dynamic";

function serializeTransaction<T extends { amountMinor: bigint; feeMinor: bigint }>(transaction: T) {
  return { ...transaction, amountMinor: transaction.amountMinor.toString(), feeMinor: transaction.feeMinor.toString() };
}

function errorStatus(error: unknown) {
  const message = error instanceof Error ? error.message : "Request failed.";
  if (message === "Authentication is required.") return 401;
  if (message.includes("not authorized") || message.includes("role is not permitted")) return 403;
  return 400;
}

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    const transactions = await prisma.paymentTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ ok: true, transactions: transactions.map(serializeTransaction) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load transactions.";
    return NextResponse.json({ error: message }, { status: errorStatus(error) });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const body = parseJsonObject(await request.json());
    const accountId = requireText(body.accountId, "accountId", 128);
    const currency = requireText(body.currency, "currency", 32).toUpperCase();
    const amountMinor = requirePositiveMinorUnit(body.amountMinor);
    const idempotencyKey = requireIdempotencyKey(body.idempotencyKey);
    const kind = requireText(body.kind, "kind", 32).toUpperCase();

    if (kind !== "DEPOSIT" && kind !== "WITHDRAWAL") throw new Error("Transaction kind must be DEPOSIT or WITHDRAWAL.");

    const existing = await prisma.paymentTransaction.findUnique({ where: { idempotencyKey } });
    if (existing) return NextResponse.json({ ok: true, transaction: serializeTransaction(existing), idempotent: true });

    const account = await prisma.financialAccount.findFirst({ where: { id: accountId, userId: user.id } });
    if (!account) throw new Error("Financial account was not found for the authenticated user.");
    if (account.status !== "ACTIVE") throw new Error("Financial account is not active.");
    if (account.assetCode.toUpperCase() !== currency) throw new Error("Transaction currency does not match the financial account.");

    const transaction = await prisma.$transaction(async (tx) => {
      const created = await tx.paymentTransaction.create({
        data: {
          userId: user.id,
          accountId: account.id,
          kind: kind as "DEPOSIT" | "WITHDRAWAL",
          status: "AWAITING_APPROVAL",
          amountMinor,
          feeMinor: 0n,
          currency,
          idempotencyKey,
        },
      });
      await tx.auditEvent.create({
        data: {
          userId: user.id,
          action: `TRANSACTION_${kind}_REQUESTED`,
          target: created.id,
          metadata: { accountId: account.id, amountMinor: amountMinor.toString(), currency, idempotencyKey },
        },
      });
      return created;
    });

    return NextResponse.json({ ok: true, transaction: serializeTransaction(transaction) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create transaction request.";
    return NextResponse.json({ error: message }, { status: errorStatus(error) });
  }
}
