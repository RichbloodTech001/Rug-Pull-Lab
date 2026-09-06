"use client";

import { useMemo, useState } from "react";
import { assertBalanced, makeIdempotencyKey } from "@/lib/ledger";

export default function FinancialCorePage() {
  const [amount, setAmount] = useState("10000");
  const [currency, setCurrency] = useState("USD");
  const [message, setMessage] = useState("");
  const [entries, setEntries] = useState(0);
  const key = useMemo(() => {
    try { return makeIdempotencyKey("research", "demo-request-001"); } catch { return ""; }
  }, []);

  function validateJournal() {
    try {
      const value = BigInt(amount);
      assertBalanced([
        { accountId: "cash", amountMinor: value, currency },
        { accountId: "customer", amountMinor: value, currency },
      ]);
      setEntries(2);
      setMessage(`Balanced research journal validated: ${value.toString()} minor units ${currency}.`);
    } catch (error) {
      setEntries(0);
      setMessage(error instanceof Error ? error.message : "Journal validation failed.");
    }
  }

  return <main className="main">
    <div className="topbar"><div><div className="eyebrow">Phase 12 · PostgreSQL Financial Core</div><h1>Financial Core</h1></div><div className="status"><span className="dot" /> DATABASE SCHEMA · READY</div></div>
    <section className="grid">
      <div className="card"><div className="metric-label">Ledger Model</div><div className="metric">DOUBLE-ENTRY</div><div className="metric-note">Explicit debit / credit entries</div></div>
      <div className="card"><div className="metric-label">Money Arithmetic</div><div className="metric">INTEGER</div><div className="metric-note">Minor units via BigInt</div></div>
      <div className="card"><div className="metric-label">Idempotency</div><div className="metric">ENABLED</div><div className="metric-note">Unique request keys</div></div>
      <div className="card"><div className="metric-label">Live Custody</div><div className="metric">DISABLED</div><div className="metric-note">No signing or settlement</div></div>
    </section>
    <section className="workspace">
      <div className="card"><div className="card-title"><span>Journal Validation</span><span className="badge">RESEARCH ONLY</span></div>
        <div className="form-grid"><label>Amount in minor units<input value={amount} onChange={e => setAmount(e.target.value)} inputMode="numeric" /></label><label>Currency<input value={currency} onChange={e => setCurrency(e.target.value.toUpperCase())} maxLength={12} /></label></div>
        <button className="primary-button" onClick={validateJournal}>Validate Balanced Journal</button>
        {message && <div className="empty-state">{message}</div>}
      </div>
      <div className="card"><div className="card-title"><span>Financial Controls</span><span className="badge">SERVER REQUIRED</span></div>
        <div className="list"><div className="list-row"><span className="muted">Journal entries</span><strong>{entries || "—"}</strong></div><div className="list-row"><span className="muted">Idempotency key</span><strong className="mono">{key}</strong></div><div className="list-row"><span className="muted">Client balance editing</span><strong>Disabled</strong></div><div className="list-row"><span className="muted">Custody signing</span><strong>Disabled</strong></div></div>
      </div>
    </section>
    <section className="card"><div className="card-title"><span>Production Requirements</span><span className="badge">NOT YET LIVE</span></div><div className="list"><div className="list-row"><span>Atomic database transactions</span><strong>Required</strong></div><div className="list-row"><span>Database migrations and backups</span><strong>Required</strong></div><div className="list-row"><span>Server-side authorization</span><strong>Required</strong></div><div className="list-row"><span>Custody provider</span><strong>Phase 14</strong></div><div className="list-row"><span>Deposit / withdrawal settlement</span><strong>Phase 13–15</strong></div></div></section>
    <p className="footer-note">Phase 12 establishes the database and accounting model. The browser never receives database credentials and this page does not post real financial transactions.</p>
  </main>;
}
