"use client";

import { useState } from "react";
import { preflightSummary, runProductionPreflight } from "@/lib/production-preflight";

export default function PreflightPage() {
  const [checks, setChecks] = useState<ReturnType<typeof runProductionPreflight> | null>(null);
  const summary = checks ? preflightSummary(checks) : null;
  return <main className="main">
    <div className="topbar"><div><div className="eyebrow">Phase 10 · Production Hardening</div><h1>Production Preflight</h1></div><div className="status"><span className="dot" /> SAFE DEPLOYMENT CHECK</div></div>
    <section className="grid">
      <div className="card"><div className="metric-label">Checks</div><div className="metric">{checks?.length ?? 0}</div><div className="metric-note">Deployment readiness checks</div></div>
      <div className="card"><div className="metric-label">Pass</div><div className="metric">{summary?.pass ?? 0}</div><div className="metric-note">Validated controls</div></div>
      <div className="card"><div className="metric-label">Warnings</div><div className="metric">{summary?.warn ?? 0}</div><div className="metric-note">Production follow-ups</div></div>
      <div className="card"><div className="metric-label">Failures</div><div className="metric">{summary?.fail ?? 0}</div><div className="metric-note">Blocking checks</div></div>
    </section>
    <section className="card preflight-card"><div className="card-title"><span>Deployment Readiness</span><span className="badge">READ ONLY</span></div><p className="strategy-help">Run the preflight before publishing. Warnings are intentional where this research lab still needs production infrastructure such as authenticated server-side persistence and RBAC.</p><button className="primary-button" onClick={() => setChecks(runProductionPreflight())}>Run Production Preflight</button>{checks && <div className="preflight-list">{checks.map((check) => <div className="finding" key={check.id}><span className={`severity severity-${check.status.toLowerCase()}`}>{check.status}</span><div><strong>{check.name}</strong><p>{check.detail}</p></div></div>)}</div>}</section>
    <section className="workspace"><div className="card"><div className="card-title"><span>Hardening Checklist</span><span className="badge">RECOMMENDED</span></div><div className="list"><div className="list-row"><span>HTTPS / secure deployment</span><strong>Provider required</strong></div><div className="list-row"><span>Server-side authentication</span><strong>Required for multi-user admin</strong></div><div className="list-row"><span>RBAC</span><strong>Required for admin operations</strong></div><div className="list-row"><span>Server-side audit persistence</span><strong>Recommended</strong></div><div className="list-row"><span>Secrets</span><strong>Environment-managed only</strong></div></div></div><div className="card"><div className="card-title"><span>Safety Gates</span><span className="badge">ENFORCED</span></div><div className="list"><div className="list-row"><span>Private-key storage</span><strong>Disabled</strong></div><div className="list-row"><span>Public-market rug execution</span><strong>Disabled</strong></div><div className="list-row"><span>Asset extraction</span><strong>Disabled</strong></div><div className="list-row"><span>Paper research</span><strong>Enabled</strong></div><div className="list-row"><span>Devnet research</span><strong>Enabled</strong></div></div></div></section>
    <p className="footer-note">A successful preflight does not certify a deployment as financially regulated, secure against every threat, or ready for custody of real funds. Complete the provider, authentication, authorization, monitoring, and legal/compliance requirements appropriate to your deployment.</p>
  </main>;
}
