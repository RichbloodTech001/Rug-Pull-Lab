export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
export type Finding = { id: string; severity: Severity; title: string; detail: string; recommendation: string };
export type SecurityInput = { mint: string; mintAuthority: boolean; freezeAuthority: boolean; supply: number; decimals: number; holders: number; liquidity: number; topHolderPct: number; metadataMutable: boolean };

export function analyzeToken(input: SecurityInput): Finding[] {
  const findings: Finding[] = [];
  const add = (severity: Severity, title: string, detail: string, recommendation: string) => findings.push({ id: crypto.randomUUID(), severity, title, detail, recommendation });
  if (input.mintAuthority) add("HIGH", "Mint authority is enabled", "The mint can potentially increase token supply while the authority remains active.", "Verify the authority owner and intended supply policy; revoke it only when appropriate for the research asset.");
  if (input.freezeAuthority) add("HIGH", "Freeze authority is enabled", "An active freeze authority can restrict token-account activity.", "Review the authority and confirm that any freeze capability is intentional and documented.");
  if (input.metadataMutable) add("MEDIUM", "Metadata is mutable", "Mutable metadata can change how an asset is presented after launch.", "Inspect metadata update authority and record changes in the research audit trail.");
  if (input.topHolderPct >= 50) add("HIGH", "Concentrated holder distribution", `The largest holder is estimated at ${input.topHolderPct.toFixed(1)}% of tracked supply.`, "Investigate concentration, ownership relationships, and transfer history before treating the asset as low risk.");
  else if (input.topHolderPct >= 20) add("MEDIUM", "Elevated holder concentration", `The largest holder is estimated at ${input.topHolderPct.toFixed(1)}% of tracked supply.`, "Monitor concentration and large-holder movements over time.");
  if (input.liquidity <= 5_000) add("HIGH", "Very low tracked liquidity", `Tracked liquidity is ${input.liquidity.toLocaleString()}.`, "Treat the market as highly sensitive to order size and avoid conclusions from thin liquidity.");
  else if (input.liquidity <= 25_000) add("MEDIUM", "Low tracked liquidity", `Tracked liquidity is ${input.liquidity.toLocaleString()}.`, "Include liquidity depth and slippage in risk analysis.");
  if (input.holders < 25) add("MEDIUM", "Small holder base", `Only ${input.holders} holders are represented in the research snapshot.`, "Collect more observations before drawing conclusions about distribution risk.");
  if (input.supply <= 0 || input.decimals < 0 || input.decimals > 18) add("CRITICAL", "Invalid token parameters", "Supply or decimals are outside expected research bounds.", "Stop analysis and validate the token data source.");
  if (!findings.length) add("INFO", "No high-risk indicators detected", "The supplied snapshot did not trigger the configured heuristics.", "Continue monitoring; a clean snapshot is not proof of safety.");
  return findings;
}

export function riskScore(findings: Finding[]) {
  const weights: Record<Severity, number> = { CRITICAL: 40, HIGH: 25, MEDIUM: 12, LOW: 5, INFO: 0 };
  return Math.min(100, findings.reduce((sum, f) => sum + weights[f.severity], 0));
}
