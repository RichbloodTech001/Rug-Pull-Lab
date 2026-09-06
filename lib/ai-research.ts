export type ResearchContext = {
  riskScore?: number;
  riskLevel?: string;
  findings?: string[];
  token?: { mint?: string; supply?: string; decimals?: number; mintAuthority?: string | null; freezeAuthority?: string | null; program?: string };
};

export type ResearchAnswer = {
  answer: string;
  actions: string[];
  safety: string;
};

function level(score = 0) {
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 35) return "MODERATE";
  return "LOW";
}

export function analyzeResearchQuestion(question: string, context: ResearchContext = {}): ResearchAnswer {
  const q = question.trim().toLowerCase();
  if (!q) throw new Error("Ask a research question first.");

  const score = context.riskScore ?? 0;
  const risk = context.riskLevel ?? level(score);
  const findings = context.findings ?? [];

  if (q.includes("risk") || q.includes("safe") || q.includes("scam")) {
    return {
      answer: `Current laboratory assessment: ${risk} risk (${score}/100). This is a heuristic research score, not proof that an asset is malicious or safe. ${findings.length ? `The scan reported ${findings.length} finding(s).` : "No findings were supplied to the assistant."}`,
      actions: ["Review mint and freeze authorities", "Inspect holder concentration", "Compare liquidity and holder changes over time", "Replay suspicious market events before drawing conclusions"],
      safety: "Read-only research guidance. No asset movement or public-market manipulation is performed."
    };
  }

  if (q.includes("authority") || q.includes("freeze") || q.includes("mint")) {
    const mint = context.token?.mintAuthority ? "Mint authority is present." : "Mint authority is not present in the supplied context.";
    const freeze = context.token?.freezeAuthority ? "Freeze authority is present." : "Freeze authority is not present in the supplied context.";
    return {
      answer: `${mint} ${freeze} Authorities can materially affect token-holder risk, but their presence alone does not establish malicious intent. Review who controls them and whether the project's documented behavior matches the on-chain configuration.`,
      actions: ["Verify authority addresses", "Check whether authorities are intentionally retained", "Inspect historical authority changes", "Document evidence before assigning a final risk conclusion"],
      safety: "Authority analysis is observational and does not modify token controls."
    };
  }

  if (q.includes("holder") || q.includes("concentration")) {
    return {
      answer: "Holder concentration should be interpreted as a distribution signal rather than a verdict. Concentrated token accounts can increase volatility and governance or sell-pressure risk, while exchange, treasury, LP, and vesting accounts can distort simple rankings.",
      actions: ["Inspect the largest token accounts", "Identify known treasury/LP accounts", "Calculate top-account concentration", "Repeat the measurement across multiple snapshots"],
      safety: "Use concentration analysis for defensive research; do not use it to target or manipulate individual holders."
    };
  }

  if (q.includes("replay") || q.includes("strategy") || q.includes("trade")) {
    return {
      answer: "The laboratory can use deterministic replay and paper strategies to test hypotheses without exposing real funds. Compare entries, exits, drawdown, liquidity and holder changes rather than treating a single profitable replay as evidence of future performance.",
      actions: ["Run the scenario in Replay Lab", "Record assumptions and timestamps", "Measure drawdown and realized P/L", "Repeat with different parameters"],
      safety: "Research execution remains paper-only; live public-market manipulation is outside the laboratory boundary."
    };
  }

  return {
    answer: "I can help interpret the supplied security scan, token authorities, holder concentration, liquidity signals, strategies, and deterministic replay results. For a useful answer, provide a focused research question and run the relevant lab scan first.",
    actions: ["Run Security Research for token-level evidence", "Use Market Scanner for account-level inspection", "Use Replay Lab for historical hypotheses", "Record findings in your research notes"],
    safety: "The assistant provides defensive research guidance and does not execute destructive blockchain actions."
  };
}
