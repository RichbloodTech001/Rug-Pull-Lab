"use client";

import { useState } from "react";
import { applyConfirmation, createSettlement, type SettlementRecord } from "@/lib/settlement";

export default function SettlementPage() {
  const [record, setRecord] = useState<SettlementRecord | null>(null);
  const [confirmations, setConfirmations] = useState("0");
  const [message, setMessage] = useState("");

  function create() {
    try {
      const next = createSettlement({ transactionReference: `settlement-${Date.now()}`, network: "DEVNET", assetCode: "SOL", amountMinor: 1000000n, requiredConfirmations: 3 });
      setRecord(next);
      setMessage("Settlement queued. No transaction was broadcast.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to create settlement."); }
  }

  function confirm() {
    if (!record) return;
    try {
      const next = applyConfirmation(record, Number(confirmations));
      setRecord(next);
      setMessage(`Settlement status: ${next.status}. Confirmation data is research state only.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Confirmation update failed."); }
  }

  return <main className="main">
    <div className="topbar"><div><div className="eyebrow">Phase 15 · Blockchain Settlement</div><h1>Settlement Control</h1></div><div className="status"><span className="dot" /> DEVNET · NO BROADCAST</div></div>
    <section className="grid">
      <div className="card"><div className="metric-label">Network</div><div className="metric">DEVNET</div><div className="metric-note">Safe settlement research</div></div>
      <div className="card"><div className="metric-label">Confirmation</div><div className="metric">3 BLOCKS</div><div className="metric-note">Example finality threshold</div></div>
      <div className="card"><div className="metric-label">Webhook</div><div className="metric">READY</div><div className="metric-note">Provider adapter boundary</div></div>
      <div className="card"><div className="metric-label">Broadcast</div><div className="metric">DISABLED</div><div className="metric-note">No wallet signing</div></div>
    </section>
    <section className="workspace">
      <div className="card"><div className="card-title"><span>Settlement Lifecycle</span><span className="badge">RESEARCH</span></div><button className="primary-button" onClick={create}>Create Devnet Settlement Record</button>{record && <div className="list"><div className="list-row"><span>Status</span><strong>{record.status}</strong></div><div className="list-row"><span>Reference</span><strong className="mono">{record.transactionReference}</strong></div><div className="list-row"><span>Confirmations</span><strong>{record.confirmations} / {record.requiredConfirmations}</strong></div><div className="list-row"><span>Signature</span><strong>{record.txSignature ?? "Not broadcast"}</strong></div></div>}</div>
      <div className="card"><div className="card-title"><span>Confirmation Simulator</span><span className="badge">NO CHAIN WRITE</span></div><label>Observed confirmations<input value={confirmations} onChange={e => setConfirmations(e.target.value)} inputMode="numeric" /></label><button className="primary-button" onClick={confirm} disabled={!record}>Apply Confirmation</button>{message && <div className="empty-state">{message}</div>}</div>
    </section>
    <section className="card"><div className="card-title"><span>Settlement Safety Gates</span><span className="badge">REQUIRED</span></div><div className="list"><div className="list-row"><span>Verified provider webhook</span><strong>Required</strong></div><div className="list-row"><span>Signature/transaction validation</span><strong>Required</strong></div><div className="list-row"><span>Idempotent event processing</span><strong>Required</strong></div><div className="list-row"><span>Reorg handling</span><strong>Implemented in state model</strong></div><div className="list-row"><span>Ledger posting</span><strong>Server transaction required</strong></div><div className="list-row"><span>Production broadcast</span><strong>Disabled</strong></div></div></section>
    <p className="footer-note">Phase 15 models settlement and confirmation safely. It does not sign, broadcast, settle real funds, or treat browser-supplied confirmation data as authoritative blockchain evidence.</p>
  </main>;
}
