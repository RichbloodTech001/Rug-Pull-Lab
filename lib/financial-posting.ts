import { Prisma, TransactionKind, TransactionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assertBalanced } from "@/lib/ledger";

export class FinancialPostingError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "FinancialPostingError";
    this.status = status;
  }
}

function platformClearingAccountId() {
  const value = process.env.PLATFORM_CLEARING_ACCOUNT_ID?.trim();
  if (!value) {
    throw new FinancialPostingError(
      "Platform clearing ledger is not configured. Financial posting is disabled until a controlled clearing account is configured.",
      503,
    );
  }
  return value;
}

export async function postApprovedPayment(paymentId: string, actorUserId: string) {
  const clearingAccountId = platformClearingAccountId();

  return prisma.$transaction(async (tx) => {
    const payment = await tx.paymentTransaction.findUnique({
      where: { id: paymentId },
      include: { account: { include: { ledger: true } } },
    });

    if (!payment) throw new FinancialPostingError("Payment transaction was not found.", 404);
    if (payment.status !== TransactionStatus.AWAITING_APPROVAL) {
      if (payment.status === TransactionStatus.CONFIRMED && payment.journalId) {
        return payment;
      }
      throw new FinancialPostingError("Only awaiting-approval transactions can be posted.", 409);
    }

    if (payment.amountMinor <= 0n) throw new FinancialPostingError("Payment amount must be positive.");
    if (!payment.account.ledger) {
      throw new FinancialPostingError("The user's financial account is missing its ledger account.", 409);
    }

    const clearing = await tx.ledgerAccount.findUnique({
      where: { accountId: clearingAccountId },
      include: { account: true },
    });

    if (!clearing) throw new FinancialPostingError("Configured platform clearing account does not exist.", 503);
    if (clearing.currency.toUpperCase() !== payment.currency.toUpperCase()) {
      throw new FinancialPostingError("Platform clearing currency does not match the payment currency.", 409);
    }
    if (clearing.account.status !== "ACTIVE") {
      throw new FinancialPostingError("Platform clearing account is not active.", 409);
    }

    const debitAccountId = payment.kind === TransactionKind.DEPOSIT ? clearing.id : payment.account.ledger.id;
    const creditAccountId = payment.kind === TransactionKind.DEPOSIT ? payment.account.ledger.id : clearing.id;

    const entries = [
      {
        accountId: debitAccountId,
        amountMinor: payment.amountMinor,
        currency: payment.currency,
        direction: "DEBIT" as const,
      },
      {
        accountId: creditAccountId,
        amountMinor: payment.amountMinor,
        currency: payment.currency,
        direction: "CREDIT" as const,
      },
    ];

    assertBalanced(entries);

    const existingJournal = await tx.journalTransaction.findUnique({
      where: { idempotencyKey: payment.idempotencyKey },
    });
    if (existingJournal) {
      const updated = await tx.paymentTransaction.update({
        where: { id: payment.id },
        data: { status: TransactionStatus.CONFIRMED, journalId: existingJournal.id },
      });
      return updated;
    }

    const journal = await tx.journalTransaction.create({
      data: {
        reference: `PAY-${payment.id}`,
        description: `${payment.kind} settlement for ${payment.currency}`,
        idempotencyKey: payment.idempotencyKey,
        entries: {
          create: entries.map((entry) => ({
            ledgerAccountId: entry.accountId,
            direction: entry.direction,
            amountMinor: entry.amountMinor,
            currency: entry.currency,
          })),
        },
      },
    });

    const updated = await tx.paymentTransaction.update({
      where: { id: payment.id },
      data: { status: TransactionStatus.CONFIRMED, journalId: journal.id },
    });

    await tx.auditEvent.create({
      data: {
        userId: actorUserId,
        action: "PAYMENT_LEDGER_POSTED",
        target: payment.id,
        metadata: {
          journalId: journal.id,
          kind: payment.kind,
          amountMinor: payment.amountMinor.toString(),
          currency: payment.currency,
          idempotencyKey: payment.idempotencyKey,
        } satisfies Prisma.InputJsonValue,
      },
    });

    return updated;
  });
}
