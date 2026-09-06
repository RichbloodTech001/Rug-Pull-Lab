"use client";

import { useState } from "react";
import { assessTransactionRisk, type RiskAssessment } from "@/lib/risk-fraud";

export default function RiskFraudPage() {
  const [amount, setAmount] = useState("500000");
  const [volume, setVolume] = useState("1000000");
  const [limit, setLimit] = useState("5000000");
  const [attempts, setAttempts] = useState("2");
  const [failed, setFailed] = useState("0");
  const [newDestination, setNewDestination] = useState(false);
  const [compliance, setCompliance] = useState<"ALLOW" | "REVIEW" | "BLOCK">("ALLOW");
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [message, setMessage] = useState("");

  function run() {
    try {
      const result = assessTransactionRisk({ amountMinor: BigInt(amount), dailyVolumeMinor: BigInt(volume), dailyLimitMinor: BigInt(limit), recentAttempts: Number(attempts), failedAttempts: Number(failed), destinationNew: newDestination, complianceDecision: compliance });
      setAssessment(result); setMessage("Risk assessment completed in research mode.");
    } catch (error) { setAssessment(null); setMessage(error instanceof Error ? error.message : "Risk assessment failed."); }
  }

  return <main className="main">
    <div className="topbar"><div><div className="eyebrow">Phase 17 · Risk & Fraud</div><h1>Risk Monitoring Console</h1></div><div className="status"><span className="dot" /> RESEARCH MODE</div></div>
    <section className="grid">
      <div className="card"><div className="metric-label">Decision</div><div className="metric">{assessment?.decision ?? "—"}</div><div className="metric-note">Policy decision output</div></div>
      <div className="card"><div className="metric-label">Risk Score</div><div className="metric">{assessment?.score ?? 0}/100</div><div className="metric-note">Heuristic signal score</div></div>
      <div className="card"><div className="metric-label">Signals</div><div className="metric">{assessment?.signals.length ?? 0}</div><div className="metric-note">Triggered controls</div></div>
      <div className="card"><div className="metric-label">Live Blocking</div><div className="metric">DISABLED</div><div className="metric-note">No real transaction is affected</div></div>
    </section>
    <section className="workspace">
      <div className="card"><div className="card-title"><span>Transaction Risk Inputs</span><span className="badge">SIMULATION</span></div>
        <div className="form-grid"><label>Amount (minor units)<input value={amount} onChange={e => setAmount(e.target.value)} inputMode="numeric" /></label><label>Today&apos;s volume<input value={volume} onChange={e => setVolume(e.target.value)} inputMode="numeric" /></label><label>Daily limit<input value={limit} onChange={e => setLimit(e.target.value)} inputMode="numeric" /></label><label>Recent attempts<input value={attempts} onChange={e => setAttempts(e.target.value)} inputMode="numeric" /></label><label>Failed attempts<input value={failed} onChange={e => setFailed(e.target.value)} inputMode="numeric" /></label><label>Compliance decision<select value={compliance} onChange={e => setCompliance(e.target.value as typeof compliance)}><option>ALLOW</option><option>REVIEW</option><option>BLOCK</option></select></label></div>
        <label className="checkbox"><input type="checkbox" checked={newDestination} onChange={e => setNewDestination(e.target.checked)} /> New destination</label>
        <button className="primary-button" onClick={run}>Run Risk Assessment</button>
        {message && <div className="empty-state">{message}</div>}
      </div>
      <div className="card"><div className="card-title"><span>Triggered Signals</span><span className="badge">AUDIT INPUT</span></div>{assessment?.signals.length ? <div className="list">{assessment.signals.map(signal => <div className="list-row" key={signal.code}><span><strong>{signal.code}</strong><br/><span className="muted">{signal.reason}</span></span><strong>+{signal.points}</strong></div>)}</div> : <div className="empty-state">Run an assessment to inspect signals.</div>}</div>
    </section>
    <section className="card"><div className="card-title"><span>Production Controls Required</span><span className="badge">FUTURE</span></div><div className="list"><div className="list-row"><span>Server-side velocity enforcement</span><strong>Required</strong></div><div className="list-row"><span>Device/IP anomaly signals</span><strong>Required</strong></div><div className="list-row"><span>Address screening</span><strong>Provider required</strong></div><div className="list-row"><span>Case escalation</span><strong>Compliance workflow</strong></div><div className="list-row"><span>Model monitoring</span><strong>Required</strong></div></div></section>
    <p className="footer-note">Risk scoring is a defensive research control. It does not automatically seize funds, target individuals, manipulate markets, or authorize a real transaction.</p>
  </main>;
}
