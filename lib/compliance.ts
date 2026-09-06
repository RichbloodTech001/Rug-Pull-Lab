export type VerificationStatus = "NOT_STARTED" | "PENDING" | "VERIFIED" | "REJECTED" | "EXPIRED";
export type ComplianceCaseStatus = "OPEN" | "REVIEW" | "ESCALATED" | "CLEARED" | "CLOSED";
export type RiskTier = "LOW" | "MEDIUM" | "HIGH" | "PROHIBITED";
export type ComplianceProfile = { userId: string; kyc: VerificationStatus; kyb: VerificationStatus; sanctions: "CLEAR" | "MATCH" | "PENDING"; pep: "CLEAR" | "MATCH" | "PENDING"; sourceOfFunds: VerificationStatus; riskTier: RiskTier; };
export type ComplianceCase = { id: string; userId: string; reason: string; status: ComplianceCaseStatus; createdAt: string; };
export type TransactionScreenInput = { amountMinor: bigint; currency: string; destination?: string; country?: string; };
export type ComplianceDecision = "ALLOW" | "REVIEW" | "BLOCK";

export function evaluateTransaction(profile: ComplianceProfile, input: TransactionScreenInput): ComplianceDecision {
  if (input.amountMinor <= 0n) throw new Error("Transaction amount must be positive.");
  if (!/^[A-Z0-9._-]{2,16}$/.test(input.currency.trim().toUpperCase())) throw new Error("Invalid currency code.");
  if (profile.riskTier === "PROHIBITED") return "BLOCK";
  if (profile.sanctions === "MATCH" || profile.pep === "MATCH") return "BLOCK";
  if (profile.sanctions === "PENDING" || profile.pep === "PENDING") return "REVIEW";
  if (profile.kyc !== "VERIFIED" || profile.sourceOfFunds !== "VERIFIED") return "REVIEW";
  if (profile.kyb !== "VERIFIED" && profile.kyb !== "NOT_STARTED") return "REVIEW";
  if (profile.riskTier === "HIGH" || profile.riskTier === "MEDIUM") return "REVIEW";
  return "ALLOW";
}

export function createComplianceCase(userId: string, reason: string): ComplianceCase {
  if (!userId.trim()) throw new Error("User ID is required.");
  if (!reason.trim()) throw new Error("Compliance case reason is required.");
  return { id: crypto.randomUUID(), userId: userId.trim(), reason: reason.trim(), status: "OPEN", createdAt: new Date().toISOString() };
}

export function nextCaseStatus(current: ComplianceCaseStatus, next: ComplianceCaseStatus) {
  const allowed: Record<ComplianceCaseStatus, ComplianceCaseStatus[]> = { OPEN: ["REVIEW", "ESCALATED", "CLOSED"], REVIEW: ["ESCALATED", "CLEARED", "CLOSED"], ESCALATED: ["REVIEW", "CLEARED", "CLOSED"], CLEARED: ["CLOSED"], CLOSED: [] };
  if (!allowed[current].includes(next)) throw new Error(`Invalid compliance case transition: ${current} → ${next}.`);
  return next;
}
