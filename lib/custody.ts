export type CustodyProvider = "UNCONFIGURED" | "FIREBLOCKS" | "COPPER" | "BITGO" | "CUSTOM";
export type CustodyEnvironment = "SANDBOX" | "PRODUCTION";
export type ApprovalTier = "STANDARD" | "HIGH_VALUE" | "MANUAL_REVIEW";

export type CustodyPolicy = {
  provider: CustodyProvider;
  environment: CustodyEnvironment;
  enabled: boolean;
  signingEnabled: boolean;
  requireTwoPersonApproval: boolean;
  allowlistedOnly: boolean;
  dailyLimitMinor: bigint;
  highValueThresholdMinor: bigint;
};

export type CustodyRequest = {
  id: string;
  transactionReference: string;
  assetCode: string;
  amountMinor: bigint;
  destination: string;
  approvalTier: ApprovalTier;
  status: "QUEUED" | "BLOCKED" | "READY_FOR_PROVIDER";
};

export function defaultCustodyPolicy(): CustodyPolicy {
  return {
    provider: "UNCONFIGURED",
    environment: "SANDBOX",
    enabled: false,
    signingEnabled: false,
    requireTwoPersonApproval: true,
    allowlistedOnly: true,
    dailyLimitMinor: 0n,
    highValueThresholdMinor: 0n,
  };
}

export function classifyApproval(amountMinor: bigint, thresholdMinor: bigint): ApprovalTier {
  if (amountMinor <= 0n) throw new Error("Custody amount must be positive.");
  if (thresholdMinor > 0n && amountMinor >= thresholdMinor) return "HIGH_VALUE";
  return "STANDARD";
}

export function evaluateCustodyRequest(policy: CustodyPolicy, input: Omit<CustodyRequest, "id" | "approvalTier" | "status">): CustodyRequest {
  if (!input.transactionReference.trim()) throw new Error("Transaction reference is required.");
  if (!input.assetCode.trim()) throw new Error("Asset code is required.");
  if (!input.destination.trim()) throw new Error("Destination is required.");
  if (input.amountMinor <= 0n) throw new Error("Custody amount must be positive.");

  const approvalTier = classifyApproval(input.amountMinor, policy.highValueThresholdMinor);
  const ready = policy.enabled && policy.provider !== "UNCONFIGURED" && policy.environment === "SANDBOX" && !policy.signingEnabled;
  return {
    ...input,
    id: crypto.randomUUID(),
    approvalTier: approvalTier === "HIGH_VALUE" ? "MANUAL_REVIEW" : approvalTier,
    status: ready ? "READY_FOR_PROVIDER" : "BLOCKED",
  };
}
