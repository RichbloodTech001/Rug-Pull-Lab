export type CertificationStatus = "PASS" | "WARN" | "BLOCKED";
export type CertificationDomain = "TECHNICAL" | "SECURITY" | "FINANCIAL" | "CUSTODY" | "COMPLIANCE" | "OPERATIONS" | "RECOVERY";

export type CertificationCheck = { id: string; domain: CertificationDomain; name: string; status: CertificationStatus; detail: string; blocking: boolean };

export function runCertificationChecks(): CertificationCheck[] {
  return [
    { id: "technical", domain: "TECHNICAL", name: "Application build integrity", status: "PASS", detail: "The application has a defined production build and verification workflow.", blocking: true },
    { id: "secrets", domain: "SECURITY", name: "Application-held private keys", status: "PASS", detail: "The research client does not store unrestricted private keys or seed phrases.", blocking: true },
    { id: "auth", domain: "SECURITY", name: "Production authentication", status: "WARN", detail: "Secure server-side sessions, recovery controls and enforced MFA remain deployment requirements.", blocking: true },
    { id: "ledger", domain: "FINANCIAL", name: "Double-entry financial integrity", status: "PASS", detail: "Ledger architecture requires explicit debit/credit balancing and idempotent journal references.", blocking: true },
    { id: "custody", domain: "CUSTODY", name: "Institutional custody", status: "BLOCKED", detail: "No production custody provider, HSM/MPC signing policy or verified production workflow is configured in the research application.", blocking: true },
    { id: "compliance", domain: "COMPLIANCE", name: "Legal and compliance authorization", status: "BLOCKED", detail: "Technical code cannot certify licensing, regulatory authorization, KYC/AML operations or jurisdictional approval.", blocking: true },
    { id: "reconciliation", domain: "FINANCIAL", name: "Reconciliation", status: "WARN", detail: "Server-side provider, blockchain and ledger reconciliation must be deployed and monitored.", blocking: true },
    { id: "monitoring", domain: "OPERATIONS", name: "Production monitoring", status: "WARN", detail: "Centralized logs, alerting, uptime monitoring and security monitoring must be configured.", blocking: false },
    { id: "recovery", domain: "RECOVERY", name: "Backup and recovery drills", status: "WARN", detail: "Encrypted backups and documented restore testing are required before production.", blocking: true },
    { id: "incident", domain: "OPERATIONS", name: "Incident response", status: "WARN", detail: "Detection, containment, escalation, evidence preservation and recovery procedures must be operational.", blocking: false },
  ];
}

export function certificationSummary(checks: CertificationCheck[]) {
  const blocked = checks.filter(c => c.status === "BLOCKED");
  const warnings = checks.filter(c => c.status === "WARN");
  const passed = checks.filter(c => c.status === "PASS");
  const blockingWarnings = warnings.filter(c => c.blocking);
  const certified = blocked.length === 0 && blockingWarnings.length === 0;
  return { total: checks.length, passed: passed.length, warnings: warnings.length, blocked: blocked.length, blockingWarnings: blockingWarnings.length, certified };
}
