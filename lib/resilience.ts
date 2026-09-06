export type HealthStatus = "HEALTHY" | "DEGRADED" | "OUTAGE";
export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type IncidentStatus = "OPEN" | "INVESTIGATING" | "CONTAINED" | "RESOLVED";
export type RecoveryCheck = { id: string; name: string; status: "READY" | "REQUIRED"; detail: string };

export function evaluateHealth(input: { database: boolean; provider: boolean; monitoring: boolean; reconciliation: boolean }): HealthStatus {
  const healthy = Object.values(input).filter(Boolean).length;
  if (healthy === 4) return "HEALTHY";
  if (healthy > 0) return "DEGRADED";
  return "OUTAGE";
}

export function createIncident(title: string, severity: IncidentSeverity) {
  if (!title.trim()) throw new Error("Incident title is required.");
  return { id: crypto.randomUUID(), title: title.trim(), severity, status: "OPEN" as IncidentStatus, detectedAt: new Date().toISOString() };
}

export function transitionIncident(status: IncidentStatus, next: IncidentStatus) {
  const allowed: Record<IncidentStatus, IncidentStatus[]> = { OPEN: ["INVESTIGATING", "CONTAINED", "RESOLVED"], INVESTIGATING: ["CONTAINED", "RESOLVED"], CONTAINED: ["INVESTIGATING", "RESOLVED"], RESOLVED: [] };
  if (status !== next && !allowed[status].includes(next)) throw new Error(`Invalid incident transition: ${status} -> ${next}`);
  return next;
}

export function recoveryChecklist(): RecoveryCheck[] {
  return [
    { id: "backup", name: "Encrypted database backups", status: "REQUIRED", detail: "Use provider-managed or equivalent encrypted backups with retention controls." },
    { id: "restore", name: "Restore drill", status: "REQUIRED", detail: "Restore into an isolated environment and verify ledger integrity before relying on the backup." },
    { id: "secrets", name: "Secret rotation plan", status: "REQUIRED", detail: "Rotate credentials after suspected exposure and document ownership and recovery paths." },
    { id: "monitoring", name: "Central monitoring", status: "REQUIRED", detail: "Aggregate application, database, provider and security signals with actionable alerts." },
    { id: "incident", name: "Incident response", status: "REQUIRED", detail: "Maintain detection, containment, evidence preservation, escalation and recovery procedures." },
    { id: "reconciliation", name: "Post-incident reconciliation", status: "REQUIRED", detail: "Compare ledger, provider and blockchain records before reopening affected operations." },
  ];
}
