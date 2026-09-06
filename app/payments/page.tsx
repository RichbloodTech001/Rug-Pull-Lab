"use client";

import { useState } from "react";
import { demoPayment, PaymentKind, PaymentStatus, transitionPayment } from "@/lib/payment-engine";

const statuses: PaymentStatus[] = ["PENDING", "PROCESSING", "AWAITING_APPROVAL", "CONFIRMED", "FAILED", "CANCELLED", "REVERSED"];

export default function PaymentsPage() {
  const [kind, setKind] = useState<PaymentKind>("DEPOSIT");
  const [amount, setAmount] = useState("10000");
  const [currency, setCurrency] = useState("USD");
  const [status, setStatus] = useState<PaymentStatus>("PENDING");
  const [message, setMessage] = useState("");

  function create() {
    try {
      const payment = demoPayment(kind, BigInt(amount), currency);
      setStatus(payment.status);
      setMessage(`Research payment created. Fee estimate: ${payment.feeMinor.toString()} minor units. Idempotency: ${payment.idempotencyKey}`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Payment rejected."); }
  }

  function move(next: PaymentStatus) {
    try { setStatus(transitionPayment(status, next)); setMessage(`State transition accepted: ${status} → ${next}.`); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Transition rejected."); }
  }

  return <main className="main">
    <div className="topbar"><div><div className="eyebrow">Phase 13 · Payment & Transaction Engine</div><h1>Transaction Control</h1></div><div className="status"><span className="dot" /> RESEARCH PAYMENT MODE</div></div>
    <section className="grid">
      <div className="card"><div className="metric-label">Transaction Types</div><div className="metric">4</div><div className="metric-note">Deposit · withdrawal · fee · adjustment</div></div>
      <div className="card"><div className="metric-label">State Machine</div><div className="metric">ENFORCED</div><div className="metric-note">Controlled transitions only</div></div>
      <div className="card"><div className="metric-label">Idempotency</div><div className="metric">REQUIRED</div><div className="metric-note">Duplicate request protection</div></div>
      <div className="card"><div className="metric-label">Settlement</div><div className="metric">DISABLED</div><div className="metric-note">No processor or custody broadcast</div></div>
    </section>
    <section className="workspace">
      <div className="card"><div className="card-title"><span>Payment Request</span><span className="badge">RESEARCH ONLY</span></div>
        <div className="form-grid"><label>Type<select value={kind} onChange={e => setKind(e.target.value as PaymentKind)}><option>DEPOSIT</option><option>WITHDRAWAL</option><option>FEE</option><option>ADJUSTMENT</option></select></label><label>Currency<input value={currency} onChange={e => setCurrency(e.target.value.toUpperCase())} /></label><label>Amount (minor units)<input value={amount} onChange={e => setAmount(e.target.value)} inputMode="numeric" /></label></div>
        <button className="primary-button" onClick={create}>Create Research Transaction</button>
        {message && <div className="empty-state">{message}</div>}
      </div>
      <div className="card"><div className="card-title"><span>Lifecycle</span><span className="badge">{status}</span></div>
        <div className="list"><div className="list-row"><span className="muted">Current state</span><strong>{status}</strong></div><div className="list-row"><span className="muted">Processor broadcast</span><strong>Disabled</strong></div><div className="list-row"><span className="muted">Ledger settlement</span><strong>Server-controlled</strong></div><div className="list-row"><span className="muted">Approval gate</span><strong>{status === "AWAITING_APPROVAL" ? "Required" : "Policy dependent"}</strong></div></div>
        <div className="replay-controls">{statuses.map(next => <button className="secondary" key={next} onClick={() => move(next)} disabled={next === status}>{next}</button>)}</div>
      </div>
    </section>
    <section className="card"><div className="card-title"><span>Settlement Pipeline</span><span className="badge">PHASE 13</span></div><div className="list"><div className="list-row"><span>1. Request validation</span><strong>Defined</strong></div><div className="list-row"><span>2. Idempotency check</span><strong>Defined</strong></div><div className="list-row"><span>3. Risk / compliance gate</span><strong>Phase 16–17</strong></div><div className="list-row"><span>4. Ledger posting</span><strong>Phase 12 + server transaction</strong></div><div className="list-row"><span>5. External settlement</span><strong>Phase 14–15</strong></div><div className="list-row"><span>6. Reconciliation</span><strong>Phase 18</strong></div></div></section>
    <p className="footer-note">Phase 13 models transaction lifecycle and fees without connecting to a bank, payment processor, custody provider, or live blockchain settlement layer.</p>
  </main>;
}
