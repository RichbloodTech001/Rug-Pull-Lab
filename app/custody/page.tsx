"use client";

import { useState } from "react";
import { defaultCustodyPolicy, evaluateCustodyRequest } from "@/lib/custody";

export default function CustodyPage() {
  const [policy, setPolicy] = useState(defaultCustodyPolicy());
  const [amount, setAmount] = useState("100000");
  const [destination, setDestination] = useState("sandbox-destination");
  const [message, setMessage] = useState("");

  function evaluate() {
    try {
      const request = evaluateCustodyRequest(policy, {
        transactionReference: `research-${Date.now()}`,
        assetCode: "USD",
        amountMinor: BigInt(amount),
        destination,
      });
      setMessage(`${request.status}: ${request.approvalTier}. No signing or broadcast was performed.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Custody policy evaluation failed.");
    }
  }

  return <main className="main">
    <div className="topbar"><div><div className="eyebrow">Phase 14 · Institutional Custody</div><h1>Custody Control Plane</h1></div><div className="status"><span className="dot" /> SAFE CUSTODY BOUNDARY</div></div>
    <section className="grid">
      <div className="card"><div className="metric-label">Provider</div><div className="metric">UNCONFIGURED</div><div className="metric-note">Provider adapter boundary only</div></div>
      <div className="card"><div className="metric-label">Environment</div><div className="metric">SANDBOX</div><div className="metric-note">Production provider disabled</div></div>
      <div className="card"><div className="metric-label">Signing</div><div className="metric">DISABLED</div><div className="metric-note">No private keys in application</div></div>
      <div className="card"><div className="metric-label">Approval</div><div className="metric">2-PERSON</div><div className="metric-note">High-value requests require review</div></div>
    </section>
    <section className="workspace">
      <div className="card"><div className="card-title"><span>Custody Policy</span><span className="badge">SAFE DEFAULTS</span></div>
        <div className="list"><div className="list-row"><span>Provider</span><strong>{policy.provider}</strong></div><div className="list-row"><span>Custody enabled</span><strong>{policy.enabled ? "YES" : "NO"}</strong></div><div className="list-row"><span>Signing enabled</span><strong>{policy.signingEnabled ? "YES" : "NO"}</strong></div><div className="list-row"><span>Allowlisted destinations</span><strong>{policy.allowlistedOnly ? "REQUIRED" : "NOT REQUIRED"}</strong></div><div className="list-row"><span>Two-person approval</span><strong>{policy.requireTwoPersonApproval ? "REQUIRED" : "OPTIONAL"}</strong></div></div>
      </div>
      <div className="card"><div className="card-title"><span>Sandbox Request Evaluation</span><span className="badge">NO BROADCAST</span></div>
        <div className="form-grid"><label>Amount in minor units<input value={amount} onChange={e => setAmount(e.target.value)} inputMode="numeric" /></label><label>Destination<input value={destination} onChange={e => setDestination(e.target.value)} /></label></div>
        <button className="primary-button" onClick={evaluate}>Evaluate Custody Request</button>
        {message && <div className="empty-state">{message}</div>}
      </div>
    </section>
    <section className="card"><div className="card-title"><span>Provider Integration Requirements</span><span className="badge">FUTURE</span></div><div className="list"><div className="list-row"><span>Provider API credentials</span><strong>Server secret manager</strong></div><div className="list-row"><span>Webhook verification</span><strong>Required</strong></div><div className="list-row"><span>Destination allowlist</span><strong>Required</strong></div><div className="list-row"><span>Approval policy</span><strong>Required</strong></div><div className="list-row"><span>HSM/MPC signing</span><strong>Provider-managed</strong></div><div className="list-row"><span>Reconciliation</span><strong>Phase 18</strong></div></div></section>
    <p className="footer-note">Phase 14 defines the institutional custody integration boundary. It intentionally does not hold private keys, enable production signing, broadcast transactions, or activate real-money custody.</p>
  </main>;
}
