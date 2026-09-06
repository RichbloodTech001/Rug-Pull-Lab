export type AuditEvent = { id: string; actor: string; action: string; target: string; severity: "INFO" | "WARNING" | "CRITICAL"; timestamp: string };
export type Experiment = { id: string; name: string; module: string; status: "RUNNING" | "PAUSED" | "COMPLETED"; createdAt: string };

export const defaultAuditEvents: AuditEvent[] = [
  { id: "audit-1", actor: "system", action: "LAB_STARTED", target: "DEVNET", severity: "INFO", timestamp: new Date().toISOString() },
  { id: "audit-2", actor: "system", action: "SAFETY_POLICY_LOADED", target: "SAFE_MODE", severity: "INFO", timestamp: new Date().toISOString() },
];

export const defaultExperiments: Experiment[] = [
  { id: "exp-1", name: "Authority Risk Baseline", module: "Security Research", status: "RUNNING", createdAt: new Date().toISOString() },
  { id: "exp-2", name: "Deterministic Replay Sample", module: "Replay Lab", status: "COMPLETED", createdAt: new Date().toISOString() },
];

export function createAuditEvent(action: string, target: string, severity: AuditEvent["severity"] = "INFO", actor = "operator"): AuditEvent {
  if (!action.trim() || !target.trim()) throw new Error("Audit action and target are required.");
  return { id: crypto.randomUUID(), actor, action: action.trim(), target: target.trim(), severity, timestamp: new Date().toISOString() };
}

export function createExperiment(name: string, module: string): Experiment {
  if (!name.trim() || !module.trim()) throw new Error("Experiment name and module are required.");
  return { id: crypto.randomUUID(), name: name.trim(), module: module.trim(), status: "RUNNING", createdAt: new Date().toISOString() };
}
