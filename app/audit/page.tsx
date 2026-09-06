"use client";

import { useMemo } from "react";
import { invariantSummary, runCoreInvariants } from "@/lib/audit-invariants";

export default function AuditPage() {
  const checks = useMemo(() => runCoreInvariants(), []);
  const summary = invariantSummary(checks);

  return (
    <main className="main">
      <div className="topbar">
        <div><div className="eyebrow">End-to-end verification</div><h1>System Audit</h1></div>
        <div className="status"><span className="dot" /> {summary.healthy ? "AUDIT HEALTHY" : "AUDIT ATTENTION"}</div>
      </div>
      <section className="grid">
        <div className="card"><div className="metric-label">Checks</div><div className="metric">{summary.total}</div><div className="metric-note">Core safety invariants</div></div>
        <div className="card"><div className="metric-label">Passed</div><div className="metric">{summary.passed}</div><div className="metric-note">Validated controls</div></div>
        <div className="card"><div className="metric-label">Failed</div><div className="metric">{summary.failed}</div><div className="metric-note">Must be resolved before certification</div></div>
        <div className="card"><div className="metric-label">Execution</div><div className="metric">SAFE</div><div className="metric-note">No live destructive execution</div></div>
      </section>
      <section className="card">
        <div className="card-title"><span>Core Invariants</span><span className="badge">PHASE 1–20 AUDIT</span></div>
        <div className="list">
          {checks.map((check) => <div className="list-row" key={check.id}><span><strong>{check.name}</strong><br/><span className="muted">{check.detail}</span></span><strong>{check.status}</strong></div>)}
        </div>
      </section>
      <p className="footer-note">This audit verifies application safety invariants. It does not certify legal authorization, regulated custody, or production financial operations.</p>
    </main>
  );
}
