"use client";

import { useState } from "react";
import { createComplianceCase, evaluateTransaction, nextCaseStatus, type ComplianceCaseStatus, type ComplianceProfile } from "@/lib/compliance";

const baseProfile: ComplianceProfile = { userId: "research-user", kyc: "VERIFIED", kyb: "NOT_STARTED", sanctions: "CLEAR", pep: "CLEAR", sourceOfFunds: "VERIFIED", riskTier: "LOW" };

export default function CompliancePage() {
  const [profile, setProfile] = useState(baseProfile);
  const [decision, setDecision] = useState("");
  const [caseStatus, setCaseStatus] = useState<ComplianceCaseStatus>("OPEN");
  const [message, setMessage] = useState("");

  function screen() {
    try { setDecision(evaluateTransaction(profile, { amountMinor: 100000n, currency: "USD" })); setMessage("Transaction screening evaluated from the supplied research profile."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Screening failed."); }
  }

  function openCase() {
    try { const item = createComplianceCase(profile.userId, "Research review requested"); setCaseStatus(item.status); setMessage(`Compliance case ${item.id} opened.`); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Unable to open case."); }
  }

  function moveCase(next: ComplianceCaseStatus) {
    try { setCaseStatus(nextCaseStatus(caseStatus, next)); setMessage(`Case transition accepted: ${caseStatus} → ${next}.`); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Case transition rejected."); }
  }

  return <main className="main">
    <div className="topbar"><div><div className="eyebrow">Phase 16 · KYC / AML & Compliance</div><h1>Compliance Control</h1></div><div className="status"><span className="dot" /> DEFENSIVE COMPLIANCE MODE</div></div>
    <section className="grid"><div className="card"><div className="metric-label">KYC</div><div className="metric">{profile.kyc}</div><div className="metric-note">Verification state</div></div><div className="card"><div className="metric-label">Sanctions</div><div className="metric">{profile.sanctions}</div><div className="metric-note">Provider screening boundary</div></div><div className="card"><div className="metric-label">Risk Tier</div><div className="metric">{profile.riskTier}</div><div className="metric-note">Policy classification</div></div><div className="card"><div className="metric-label">Decision</div><div className="metric">{decision || "—"}</div><div className="metric-note">Research screening result</div></div></section>
    <section className="workspace"><div className="card"><div className="card-title"><span>Compliance Profile</span><span className="badge">RESEARCH DATA</span></div><div className="form-grid"><label>KYC<select value={profile.kyc} onChange={e => setProfile(p => ({ ...p, kyc: e.target.value as ComplianceProfile["kyc"] }))}><option>NOT_STARTED</option><option>PENDING</option><option>VERIFIED</option><option>REJECTED</option><option>EXPIRED</option></select></label><label>Source of funds<select value={profile.sourceOfFunds} onChange={e => setProfile(p => ({ ...p, sourceOfFunds: e.target.value as ComplianceProfile["sourceOfFunds"] }))}><option>NOT_STARTED</option><option>PENDING</option><option>VERIFIED</option><option>REJECTED</option><option>EXPIRED</option></select></label><label>Sanctions<select value={profile.sanctions} onChange={e => setProfile(p => ({ ...p, sanctions: e.target.value as ComplianceProfile["sanctions"] }))}><option>CLEAR</option><option>PENDING</option><option>MATCH</option></select></label><label>PEP<select value={profile.pep} onChange={e => setProfile(p => ({ ...p, pep: e.target.value as ComplianceProfile["pep"] }))}><option>CLEAR</option><option>PENDING</option><option>MATCH</option></select></label><label>Risk tier<select value={profile.riskTier} onChange={e => setProfile(p => ({ ...p, riskTier: e.target.value as ComplianceProfile["riskTier"] }))}><option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>PROHIBITED</option></select></label></div><div className="strategy-actions"><button className="primary" onClick={screen}>Screen Transaction</button><button className="secondary" onClick={openCase}>Open Compliance Case</button></div>{message && <div className="empty-state">{message}</div>}</div>
      <div className="card"><div className="card-title"><span>Case Workflow</span><span className="badge">{caseStatus}</span></div><div className="list"><div className="list-row"><span>Current case state</span><strong>{caseStatus}</strong></div><div className="list-row"><span>KYC / AML provider</span><strong>Integration boundary</strong></div><div className="list-row"><span>Sanctions source</span><strong>External screening required</strong></div></div><div className="replay-controls">{(["REVIEW", "ESCALATED", "CLEARED", "CLOSED"] as ComplianceCaseStatus[]).map(next => <button className="secondary" key={next} onClick={() => moveCase(next)}>{next}</button>)}</div></div></section>
    <section className="card"><div className="card-title"><span>Production Compliance Requirements</span><span className="badge">REQUIRED</span></div><div className="list"><div className="list-row"><span>Identity verification provider</span><strong>Required</strong></div><div className="list-row"><span>Sanctions / PEP screening</span><strong>Required</strong></div><div className="list-row"><span>Transaction monitoring</span><strong>Phase 17</strong></div><div className="list-row"><span>Source-of-funds controls</span><strong>Required</strong></div><div className="list-row"><span>Regulatory reporting</span><strong>Jurisdiction dependent</strong></div></div></section>
    <p className="footer-note">Phase 16 is a policy and research boundary. It does not perform real KYC, sanctions screening, law-enforcement checks, or regulatory certification, and it cannot approve real-money transactions by itself.</p>
  </main>;
}
