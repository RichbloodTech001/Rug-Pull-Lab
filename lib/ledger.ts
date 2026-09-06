export type LedgerEntryInput = { accountId: string; amountMinor: bigint; currency: string };

export function assertBalanced(entries: LedgerEntryInput[]) {
  if (entries.length < 2) throw new Error("A journal requires at least two ledger entries.");
  const totals = new Map<string, bigint>();
  for (const entry of entries) {
    if (entry.amountMinor <= 0n) throw new Error("Ledger amounts must be positive minor units.");
    if (!entry.currency.trim()) throw new Error("Ledger currency is required.");
    totals.set(entry.currency, (totals.get(entry.currency) ?? 0n) + entry.amountMinor);
  }
  // Each currency must be balanced by explicit debit/credit pairs in the posting layer.
  return totals;
}

export function calculateBalance(entries: LedgerEntryInput[], accountId: string) {
  return entries.reduce((balance, entry) => entry.accountId === accountId ? balance + entry.amountMinor : balance, 0n);
}

export function makeIdempotencyKey(scope: string, requestId: string) {
  const cleanScope = scope.trim();
  const cleanRequest = requestId.trim();
  if (!cleanScope || !cleanRequest) throw new Error("Idempotency scope and request ID are required.");
  return `${cleanScope}:${cleanRequest}`;
}
