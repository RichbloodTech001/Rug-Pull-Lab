export type PreflightCheck = { id: string; name: string; status: "PASS" | "WARN" | "FAIL"; detail: string };

export function runProductionPreflight(): PreflightCheck[] {
  return [
    { id: "env", name: "Environment configuration", status: process.env.NEXT_PUBLIC_SOLANA_NETWORK ? "PASS" : "WARN", detail: process.env.NEXT_PUBLIC_SOLANA_NETWORK ? `Configured network: ${process.env.NEXT_PUBLIC_SOLANA_NETWORK}` : "Network is not explicitly configured; the application defaults to Devnet." },
    { id: "secrets", name: "Client-side secret exposure", status: "PASS", detail: "No private-key or seed-phrase storage is implemented in the research client." },
    { id: "execution", name: "Destructive execution boundary", status: "PASS", detail: "Public-market destructive execution is not implemented." },
    { id: "research", name: "Research environment", status: "PASS", detail: "Paper and research workflows are separated from live asset movement." },
    { id: "persistence", name: "Operational persistence", status: "WARN", detail: "Operations data is browser-local. Production requires authenticated server-side persistence." },
    { id: "auth", name: "Authentication and authorization", status: "WARN", detail: "Production identity, secure sessions and enforced RBAC must be server-side." },
    { id: "backup", name: "Backup and restore", status: "WARN", detail: "Configure encrypted database backups and regularly perform documented restore drills before production." },
    { id: "incident", name: "Incident response", status: "WARN", detail: "Define detection, containment, escalation, evidence preservation, recovery and post-incident review procedures." },
    { id: "monitoring", name: "Operational monitoring", status: "WARN", detail: "Production requires centralized logs, alerting, uptime checks and security monitoring." },
    { id: "reconciliation", name: "Reconciliation controls", status: "WARN", detail: "Provider, blockchain and ledger reconciliation must run server-side with exception escalation and idempotency." },
  ];
}

export function preflightSummary(checks: PreflightCheck[]) {
  return { pass: checks.filter(c => c.status === "PASS").length, warn: checks.filter(c => c.status === "WARN").length, fail: checks.filter(c => c.status === "FAIL").length };
}
