export type ReconciliationSource = "LEDGER" | "CUSTODY" | "BLOCKCHAIN" | "PAYMENT_PROVIDER";
export type ReconciliationStatus = "MATCHED" | "MISMATCH" | "MISSING_COUNTERPARTY" | "DUPLICATE";
export type ReconciliationRecord = { id: string; reference: string; source: ReconciliationSource; externalReference?: string; assetCode: string; amountMinor: bigint; timestamp: string };
export type ReconciliationResult = { status: ReconciliationStatus; reason: string; varianceMinor: bigint };

function validateRecord(record: ReconciliationRecord) {
  if (!record.reference.trim()) throw new Error("Reference is required.");
  if (!record.assetCode.trim()) throw new Error("Asset code is required.");
  if (record.amountMinor < 0n) throw new Error("Amounts cannot be negative.");
}

export function reconcilePair(left: ReconciliationRecord, right?: ReconciliationRecord): ReconciliationResult {
  validateRecord(left);
  if (!right) return { status: "MISSING_COUNTERPARTY", reason: "No corresponding record was supplied.", varianceMinor: left.amountMinor };
  validateRecord(right);
  if (left.reference !== right.reference) return { status: "MISMATCH", reason: "Internal and external references do not match.", varianceMinor: left.amountMinor - right.amountMinor };
  if (left.assetCode !== right.assetCode) return { status: "MISMATCH", reason: "Asset codes do not match.", varianceMinor: left.amountMinor - right.amountMinor };
  const variance = left.amountMinor - right.amountMinor;
  return variance === 0n ? { status: "MATCHED", reason: "Reference, asset and amount are consistent.", varianceMinor: 0n } : { status: "MISMATCH", reason: "Amounts differ between reconciliation sources.", varianceMinor: variance };
}

export function detectDuplicateReferences(records: ReconciliationRecord[]) {
  const seen = new Set<string>(); const duplicates = new Set<string>();
  for (const record of records) { const key = record.externalReference?.trim() || record.reference.trim(); if (!key) continue; if (seen.has(key)) duplicates.add(key); seen.add(key); }
  return [...duplicates];
}

export function buildReconciliationSummary(results: ReconciliationResult[]) {
  return { total: results.length, matched: results.filter(r => r.status === "MATCHED").length, mismatched: results.filter(r => r.status === "MISMATCH").length, missing: results.filter(r => r.status === "MISSING_COUNTERPARTY").length, duplicates: results.filter(r => r.status === "DUPLICATE").length };
}
