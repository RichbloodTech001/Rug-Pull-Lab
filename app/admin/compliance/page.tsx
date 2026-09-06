"use client";

import { useCallback, useEffect, useState } from "react";

type Profile = { id: string; userId: string; kyc: string; kyb: string; sanctions: string; pep: string; sourceOfFunds: string; riskTier: string; reviewedAt: string | null; updatedAt: string; user: { id: string; email: string; createdAt: string } };
const verification = ["NOT_STARTED", "PENDING", "VERIFIED", "REJECTED", "EXPIRED"];
const screening = ["CLEAR", "PENDING", "MATCH"];
const tiers = ["LOW", "MEDIUM", "HIGH", "PROHIBITED"];

export default function AdminCompliancePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/compliance/queue?pageSize=50", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load compliance queue.");
      setProfiles(data.profiles || []);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load compliance queue."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function save(profile: Profile) {
    setSaving(profile.userId); setError(""); setMessage("");
    try {
      const response = await fetch("/api/compliance/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save compliance profile.");
      setMessage(`Compliance profile for ${profile.user.email} updated.`); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to save compliance profile."); }
    finally { setSaving(null); }
  }

  function patch(id: string, key: keyof Profile, value: string) { setProfiles(current => current.map(p => p.userId === id ? { ...p, [key]: value } : p)); }

  return <main className="main">
    <div className="topbar"><div><div className="eyebrow">Compliance · Admin Operations</div><h1>Compliance Review</h1></div><div className="status"><span className="dot" /> FAIL-CLOSED</div></div>
    <section className="grid"><div className="card"><div className="metric-label">Profiles</div><div className="metric">{profiles.length}</div><div className="metric-note">Current review page</div></div><div className="card"><div className="metric-label">Decision authority</div><div className="metric">SERVER</div><div className="metric-note">Client cannot bypass policy</div></div><div className="card"><div className="metric-label">Sanctions</div><div className="metric">REQUIRED</div><div className="metric-note">External screening boundary</div></div><div className="card"><div className="metric-label">KYC/KYB</div><div className="metric">REQUIRED</div><div className="metric-note">Verification before posting</div></div></section>
    <section className="card operations-grid"><div className="card-title"><span>Review profiles</span><button className="secondary" onClick={() => void load()} disabled={loading}>Refresh</button></div>
      {error && <div className="error-box">{error}</div>}{message && <div className="empty-state">{message}</div>}
      {loading ? <div className="empty-state">Loading compliance queue…</div> : profiles.length === 0 ? <div className="empty-state">No persisted compliance profiles are available.</div> : <div className="approval-list">{profiles.map(profile => <article className="approval-item" key={profile.userId}>
        <div className="approval-main"><div><strong>{profile.user.email}</strong><div className="muted mono">{profile.userId}</div></div><span className={`badge approval-${profile.riskTier.toLowerCase()}`}>{profile.riskTier}</span></div>
        <div className="form-grid admin-form"><label>KYC<select value={profile.kyc} onChange={e => patch(profile.userId, "kyc", e.target.value)}>{verification.map(v => <option key={v}>{v}</option>)}</select></label><label>KYB<select value={profile.kyb} onChange={e => patch(profile.userId, "kyb", e.target.value)}>{verification.map(v => <option key={v}>{v}</option>)}</select></label><label>Sanctions<select value={profile.sanctions} onChange={e => patch(profile.userId, "sanctions", e.target.value)}>{screening.map(v => <option key={v}>{v}</option>)}</select></label><label>PEP<select value={profile.pep} onChange={e => patch(profile.userId, "pep", e.target.value)}>{screening.map(v => <option key={v}>{v}</option>)}</select></label><label>Source of funds<select value={profile.sourceOfFunds} onChange={e => patch(profile.userId, "sourceOfFunds", e.target.value)}>{verification.map(v => <option key={v}>{v}</option>)}</select></label><label>Risk tier<select value={profile.riskTier} onChange={e => patch(profile.userId, "riskTier", e.target.value)}>{tiers.map(v => <option key={v}>{v}</option>)}</select></label></div>
        <div className="approval-actions"><button className="primary" onClick={() => void save(profile)} disabled={saving === profile.userId}>{saving === profile.userId ? "Saving…" : "Save review"}</button></div>
      </article>)}</div>}
    </section>
    <p className="footer-note">This interface records compliance review decisions; it is not a substitute for a licensed KYC/AML provider, sanctions service, regulatory program, or legal authorization.</p>
  </main>;
}
