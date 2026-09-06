"use client";

import { useState } from "react";
import { reconcilePair, type ReconciliationResult } from "@/lib/reconciliation";

export default function ReconciliationPage() {
  const [leftAmount, setLeftAmount] = useState("1000000");
  const [rightAmount, setRightAmount] = useState("1000000");
  const [result, setResult] = useState<ReconciliationResult | null>(null);

  function run() {
    try {
      setResult(reconcilePair(
        { id: "ledger-1", reference: "LAB-001", source: "LEDGER", assetCode: "SOL", amountMinor: BigInt(leftAmount), timestamp: new Date().toISOString() },
        { id: "chain-1", reference: "LAB-001", source: "BLOCKCHAIN", assetCode: "SOL", amountMinor: BigInt(rightAmount), timestamp: new Date().toISOString() },
      ));
    } catch { setResult({ status: "MISMATCH", reason: "Invalid reconciliation input.", varianceMinor: 0n }); }
  }

  return <main className="main">
    <div className="topbar"><div><div className="eyebrow">Phase 18 · Reconciliation</div><h1>Reconciliation Control</h1></div><div className="status"><span className="dot" /> RESEARCH MODE</div></div>
    <section className="grid"><div className="card"><div className="metric-label">Ledger Record</div><div className="metric">SOURCE A</div><div className="metric-note">Internal accounting reference</div></div><div className="card"><div className="metric-label">External Record</div><div className="metric">SOURCE B</div><div className="metric-note">Blockchain/provider observation</div></div><div className="card"><div className="metric-label">Result</div><div className="metric">{result?.status ?? "—"}</div><div className="metric-note">Deterministic comparison</div></div><div className="card"><div className="metric-label">Auto Settlement</div><div className="metric">DISABLED</div><div className="metric-note">Exceptions require server review</div></div></section>
    <section className="workspace"><div className="card"><div className="card-title"><span>Pair Reconciliation</span><span className="badge">SIMULATION</span></div><div className="form-grid"><label>Ledger amount (minor units)<input value={leftAmount} onChange={e => setLeftAmount(e.target.value)} inputMode="numeric" /></label><label>External amount (minor units)<input value={rightAmount} onChange={e => setRightAmount(e.target.value)} inputMode="numeric" /></label></div><button className="primary-button" onClick={run}>Compare Records</button></div><div className="card"><div className="card-title"><span>Exception Result</span><span className="badge">AUDIT</span></div>{result ? <div className="list"><div className="list-row"><span>Status</span><strong>{result.status}</strong></div><div className="list-row"><span>Variance</span><strong>{result.varianceMinor.toString()}</strong></div><div className="list-row"><span>Reason</span><strong>{result.reason}</strong></div></div> : <div className="empty-state">No reconciliation run yet.</div>}</div></section>
    <section className="card"><div className="card-title"><span>Production Reconciliation Gates</span><span className="badge">REQUIRED</span></div><div className="list"><div className="list-row"><span>Provider / chain evidence validation</span><strong>Required</strong></div><div className="list-row"><span>Idempotent matching</span><strong>Required</strong></div><div className="list-row"><span>Exception case workflow</span><strong>Required</strong></div><div className="list-row"><span>Ledger correction journal</span><strong>Controlled</strong></div><div className="list-row"><span>Automated fund movement</span><strong>Disabled</strong></div></div></section>
    <p className="footer-note">Reconciliation identifies accounting differences; it does not silently alter balances or move assets. Production corrections require authenticated, authorized server-side workflows and audit evidence.</p>
  </main>;
}
