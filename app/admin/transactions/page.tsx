"use client";

import { useCallback, useEffect, useState } from "react";

type QueueItem = {
  id: string; kind: string; status: string; amountMinor: string; feeMinor: string; currency: string;
  idempotencyKey: string; externalReference: string | null; createdAt: string; updatedAt: string;
  user: { id: string; email: string; complianceProfile: { kyc: string; kyb: string; sanctions: string; pep: string; sourceOfFunds: string; riskTier: string } | null };
  account: { id: string; assetCode: string; assetType: string; status: string };
};

function complianceState(item: QueueItem) {
  const p = item.user.complianceProfile;
  if (!p) return "MISSING";
  if (p.riskTier === "PROHIBITED" || p.sanctions === "MATCH" || p.pep === "MATCH") return "BLOCK";
  if ([p.kyc, p.kyb, p.sourceOfFunds].some(v => v !== "VERIFIED") || p.sanctions !== "CLEAR" || p.pep !== "CLEAR") return "REVIEW";
  return "CLEAR";
}

export default function AdminTransactionsPage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/transactions/approval?status=AWAITING_APPROVAL&pageSize=50", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load approval queue.");
      setItems(data.transactions || []);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load approval queue."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function review(id: string, decision: "APPROVE" | "REJECT") {
    setBusy(id); setError(""); setMessage("");
    try {
      const reason = decision === "REJECT" ? window.prompt("Reason for rejection (required):", "Compliance or risk policy") : undefined;
      if (decision === "REJECT" && !reason?.trim()) return;
      const response = await fetch("/api/transactions/approval", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: id, decision, ...(reason ? { reason: reason.trim() } : {}) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Review failed.");
      setMessage(decision === "APPROVE" ? "Transaction approved or sent back by the risk gate." : "Transaction rejected.");
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Review failed."); }
    finally { setBusy(null); }
  }

  return <main className="main">
    <div className="topbar"><div><div className="eyebrow">Finance · Admin Operations</div><h1>Approval Queue</h1></div><div className="status"><span className="dot" /> SERVER CONTROLLED</div></div>
    <section className="grid">
      <div className="card"><div className="metric-label">Awaiting review</div><div className="metric">{items.length}</div><div className="metric-note">Current first page</div></div>
      <div className="card"><div className="metric-label">Compliance</div><div className="metric">FAIL-CLOSED</div><div className="metric-note">Incomplete profiles require review</div></div>
      <div className="card"><div className="metric-label">Ledger</div><div className="metric">SERVER ONLY</div><div className="metric-note">No client balance mutation</div></div>
      <div className="card"><div className="metric-label">Live signing</div><div className="metric">DISABLED</div><div className="metric-note">No uncontrolled broadcasts</div></div>
    </section>
    <section className="card operations-grid">
      <div className="card-title"><span>Transactions awaiting approval</span><button className="secondary" onClick={() => void load()} disabled={loading}>Refresh</button></div>
      {error && <div className="error-box">{error}</div>}
      {message && <div className="empty-state">{message}</div>}
      {loading ? <div className="empty-state">Loading secure approval queue…</div> : items.length === 0 ? <div className="empty-state">No transactions are currently awaiting approval.</div> : <div className="approval-list">
        {items.map(item => { const compliance = complianceState(item); return <article className="approval-item" key={item.id}>
          <div className="approval-main"><div><strong>{item.kind} · {item.currency}</strong><div className="muted mono">{item.id}</div></div><span className={`badge approval-${compliance.toLowerCase()}`}>{compliance}</span></div>
          <div className="approval-details"><div><span className="muted">Amount</span><strong>{item.amountMinor}</strong></div><div><span className="muted">User</span><strong className="mono">{item.user.email}</strong></div><div><span className="muted">Account</span><strong>{item.account.assetCode} · {item.account.status}</strong></div><div><span className="muted">Risk tier</span><strong>{item.user.complianceProfile?.riskTier || "MISSING"}</strong></div></div>
          <div className="approval-actions"><button className="primary" onClick={() => void review(item.id, "APPROVE")} disabled={busy === item.id || compliance !== "CLEAR"}>Approve</button><button className="secondary" onClick={() => void review(item.id, "REJECT")} disabled={busy === item.id}>Reject</button></div>
          {compliance !== "CLEAR" && <div className="empty-state">Approval is disabled in this UI because compliance is {compliance}. The server performs the authoritative gate.</div>}
        </article>; })}
      </div>}
    </section>
    <p className="footer-note">This console provides operational review only. The server remains authoritative for authentication, RBAC, compliance, risk, ledger posting and audit. Production custody/signing is intentionally disabled until separately authorized and configured.</p>
  </main>;
}
