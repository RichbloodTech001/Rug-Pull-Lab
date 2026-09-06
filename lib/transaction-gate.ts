import { evaluateTransaction, type ComplianceProfile, type ComplianceDecision } from "@/lib/compliance";
import { assessTransactionRisk, type RiskAssessment } from "@/lib/risk-fraud";

export type TransactionGateInput = {
  amountMinor: bigint;
  currency: string;
  dailyVolumeMinor: bigint;
  dailyLimitMinor: bigint;
  recentAttempts: number;
  failedAttempts: number;
  destinationNew: boolean;
  profile?: ComplianceProfile;
};

export type TransactionGateResult = {
  complianceDecision: ComplianceDecision;
  risk: RiskAssessment;
  allowedToPost: boolean;
  reason: string;
};

export function gateTransaction(input: TransactionGateInput): TransactionGateResult {
  if (!input.profile) {
    const risk = assessTransactionRisk({
      amountMinor: input.amountMinor,
      dailyVolumeMinor: input.dailyVolumeMinor,
      dailyLimitMinor: input.dailyLimitMinor,
      recentAttempts: input.recentAttempts,
      failedAttempts: input.failedAttempts,
      destinationNew: input.destinationNew,
      complianceDecision: "REVIEW",
    });
    return {
      complianceDecision: "REVIEW",
      risk,
      allowedToPost: false,
      reason: "No compliance profile is available; transaction posting is fail-closed pending compliance review.",
    };
  }

  const complianceDecision = evaluateTransaction(input.profile, {
    amountMinor: input.amountMinor,
    currency: input.currency,
  });
  const risk = assessTransactionRisk({
    amountMinor: input.amountMinor,
    dailyVolumeMinor: input.dailyVolumeMinor,
    dailyLimitMinor: input.dailyLimitMinor,
    recentAttempts: input.recentAttempts,
    failedAttempts: input.failedAttempts,
    destinationNew: input.destinationNew,
    complianceDecision,
  });

  return {
    complianceDecision,
    risk,
    allowedToPost: complianceDecision === "ALLOW" && risk.decision === "ALLOW",
    reason: complianceDecision === "BLOCK"
      ? "Compliance screening blocked the transaction."
      : risk.decision === "BLOCK"
        ? "Transaction risk controls blocked the transaction."
        : risk.decision === "REVIEW" || complianceDecision === "REVIEW"
          ? "Transaction requires compliance or risk review before posting."
          : "Transaction passed the configured compliance and risk gates.",
  };
}
