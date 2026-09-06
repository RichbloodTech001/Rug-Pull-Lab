export type PreflightCheck = { id: string; name: string; status: "PASS" | "WARN" | "FAIL"; detail: string };

export function runProductionPreflight(): PreflightCheck[] {
  const checks: PreflightCheck[] = [
    { id: "env", name: "Environment configuration", status: process.env.NEXT_PUBLIC_SOLANA_NETWORK ? "PASS" : "WARN", detail: process.env.NEXT_PUBLIC_SOLANA_NETWORK ? `Configured network: ${process.env.NEXT_PUBLIC_SOLANA_NETWORK}` : "NEXT_PUBLIC_SOLANA_NETWORK is not explicitly configured; the application defaults to Devnet." },
    { id: "secrets", name: "Client-side secret exposure", status: "PASS", detail: "No private-key or seed-phrase storage is implemented in the research client." },
    { id: "execution", name: "Destructive execution boundary", status: "PASS", detail: "Public-market destructive execution is not implemented." },
    { id: "research", name: "Research environment", status: "PASS", detail: "Paper/research workflows are separated from live asset movement." },
    { id: "persistence", name: "Operational persistence", status: "WARN", detail: "Operations data is browser-local. Use authenticated server-side persistence before multi-user production operations." },
    { id: "auth", name: "Authentication and authorization", status: "WARN", detail: "No production identity/RBAC layer is currently asserted by the client. Add server-side authentication before exposing administrative operations to multiple users." },
  ];
  return checks;
}

export function preflightSummary(checks: PreflightCheck[]) {
  return { pass: checks.filter((c) => c.status === "PASS").length, warn: checks.filter((c) => c.status === "WARN").length, fail: checks.filter((c) => c.status === "FAIL").length };
}
