export type RiskDecision = "ALLOW" | "REVIEW" | "BLOCK";
export type RiskSignal = { code: string; points: number; reason: string };
export type RiskInput = { amountMinor: bigint; dailyVolumeMinor: bigint; dailyLimitMinor: bigint; recentAttempts: number; failedAttempts: number; destinationNew: boolean; complianceDecision: "ALLOW" | "REVIEW" | "BLOCK"; };
export type RiskAssessment = { score: number; decision: RiskDecision; signals: RiskSignal[] };

export function assessTransactionRisk(input: RiskInput): RiskAssessment {
  if (input.amountMinor <= 0n) throw new Error("Transaction amount must be positive.");
  if (input.dailyVolumeMinor < 0n || input.dailyLimitMinor < 0n) throw new Error("Daily volume and limit cannot be negative.");
  if (!Number.isInteger(input.recentAttempts) || input.recentAttempts < 0) throw new Error("Recent attempts must be a non-negative integer.");
  if (!Number.isInteger(input.failedAttempts) || input.failedAttempts < 0 || input.failedAttempts > input.recentAttempts) throw new Error("Failed attempts must be valid.");

  const signals: RiskSignal[] = [];
  if (input.complianceDecision === "BLOCK") signals.push({ code: "COMPLIANCE_BLOCK", points: 100, reason: "Compliance screening blocked the transaction." });
  else if (input.complianceDecision === "REVIEW") signals.push({ code: "COMPLIANCE_REVIEW", points: 50, reason: "Compliance screening requires review." });
  if (input.dailyLimitMinor > 0n && input.dailyVolumeMinor + input.amountMinor > input.dailyLimitMinor) signals.push({ code: "VELOCITY_LIMIT", points: 40, reason: "Projected daily volume exceeds the configured limit." });
  if (input.recentAttempts >= 8) signals.push({ code: "HIGH_ATTEMPT_RATE", points: 25, reason: "Recent transaction attempt rate is elevated." });
  if (input.failedAttempts >= 3) signals.push({ code: "FAILED_ATTEMPTS", points: 25, reason: "Multiple recent attempts failed." });
  if (input.destinationNew) signals.push({ code: "NEW_DESTINATION", points: 15, reason: "Destination has not been previously established." });

  const score = Math.min(100, signals.reduce((sum, signal) => sum + signal.points, 0));
  const decision: RiskDecision = input.complianceDecision === "BLOCK" || score >= 80 ? "BLOCK" : score >= 35 || input.complianceDecision === "REVIEW" ? "REVIEW" : "ALLOW";
  return { score, decision, signals };
}

export function velocityRemaining(dailyLimitMinor: bigint, dailyVolumeMinor: bigint) {
  if (dailyLimitMinor < 0n || dailyVolumeMinor < 0n) throw new Error("Values cannot be negative.");
  return dailyLimitMinor > dailyVolumeMinor ? dailyLimitMinor - dailyVolumeMinor : 0n;
}
