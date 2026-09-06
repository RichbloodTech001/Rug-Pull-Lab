export type LedgerDirection = "DEBIT" | "CREDIT";

export type LedgerEntryInput = {
  accountId: string;
  amountMinor: bigint;
  currency: string;
  direction: LedgerDirection;
};

export function assertBalanced(entries: LedgerEntryInput[]) {
  if (entries.length < 2) throw new Error("A journal requires at least two ledger entries.");
  const totals = new Map<string, { debit: bigint; credit: bigint }>();
  for (const entry of entries) {
    if (!entry.accountId.trim()) throw new Error("Ledger account is required.");
    if (entry.amountMinor <= 0n) throw new Error("Ledger amounts must be positive minor units.");
    const currency = entry.currency.trim().toUpperCase();
    if (!currency) throw new Error("Ledger currency is required.");
    const bucket = totals.get(currency) ?? { debit: 0n, credit: 0n };
    if (entry.direction === "DEBIT") bucket.debit += entry.amountMinor;
    else bucket.credit += entry.amountMinor;
    totals.set(currency, bucket);
  }
  for (const [currency, total] of totals) {
    if (total.debit !== total.credit) throw new Error(`Unbalanced ${currency} journal: debits ${total.debit} do not equal credits ${total.credit}.`);
  }
  return totals;
}

export function calculateBalance(entries: LedgerEntryInput[], accountId: string) {
  return entries.reduce((balance, entry) => {
    if (entry.accountId !== accountId) return balance;
    return entry.direction === "DEBIT" ? balance + entry.amountMinor : balance - entry.amountMinor;
  }, 0n);
}

export function makeIdempotencyKey(scope: string, requestId: string) {
  const cleanScope = scope.trim();
  const cleanRequest = requestId.trim();
  if (!cleanScope || !cleanRequest) throw new Error("Idempotency scope and request ID are required.");
  return `${cleanScope}:${cleanRequest}`;
}
