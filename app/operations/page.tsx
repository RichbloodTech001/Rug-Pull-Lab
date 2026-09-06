"use client";

import { useEffect, useState } from "react";
import { createAuditEvent, createExperiment, defaultAuditEvents, defaultExperiments, AuditEvent, Experiment } from "@/lib/operations";

const EXP_KEY = "rug-pull-lab:experiments";
const AUDIT_KEY = "rug-pull-lab:audit";

export default function OperationsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [name, setName] = useState("");
  const [module, setModule] = useState("Security Research");
  const [systemMode, setSystemMode] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      setExperiments(JSON.parse(localStorage.getItem(EXP_KEY) || "null") || defaultExperiments);
      setEvents(JSON.parse(localStorage.getItem(AUDIT_KEY) || "null") || defaultAuditEvents);
    } catch { setExperiments(defaultExperiments); setEvents(defaultAuditEvents); }
  }, []);

  function persist(nextExperiments: Experiment[], nextEvents: AuditEvent[]) {
    setExperiments(nextExperiments); setEvents(nextEvents);
    localStorage.setItem(EXP_KEY, JSON.stringify(nextExperiments)); localStorage.setItem(AUDIT_KEY, JSON.stringify(nextEvents));
  }

  function addExperiment() {
    try {
      const experiment = createExperiment(name, module);
      const event = createAuditEvent("EXPERIMENT_CREATED", experiment.name);
      persist([experiment, ...experiments], [event, ...events]); setName(""); setMessage("Experiment created.");
    } catch (e) { setMessage(e instanceof Error ? e.message : "Could not create experiment."); }
  }

  function toggleExperiment(id: string) {
    const current = experiments.find((item) => item.id === id); if (!current) return;
    const status = current.status === "RUNNING" ? "PAUSED" : "RUNNING";
    const next = experiments.map((item) => item.id === id ? { ...item, status } : item);
    const event = createAuditEvent(status === "RUNNING" ? "EXPERIMENT_RESUMED" : "EXPERIMENT_PAUSED", current.name, "INFO");
    persist(next, [event, ...events]);
  }

  function clearLab() {
    const event = createAuditEvent("LOCAL_OPERATIONS_RESET", "LAB_STATE", "WARNING");
    persist([], [event, ...events]); setMessage("Local operations state cleared.");
  }

  return <main className="main">
    <div className="topbar"><div><div className="eyebrow">Phase 9 · Admin & Operations</div><h1>Operations Center</h1></div><div className="status"><span className="dot" /> {systemMode ? "LAB OPERATIONAL" : "RESEARCH PAUSED"}</div></div>
    <section className="grid">
      <div className="card"><div className="metric-label">Experiments</div><div className="metric">{experiments.length}</div><div className="metric-note">Local research sessions</div></div>
      <div className="card"><div className="metric-label">Running</div><div className="metric">{experiments.filter((e) => e.status === "RUNNING").length}</div><div className="metric-note">Active experiments</div></div>
      <div className="card"><div className="metric-label">Audit Events</div><div className="metric">{events.length}</div><div className="metric-note">Local operations trail</div></div>
      <div className="card"><div className="metric-label">Safety Mode</div><div className="metric">ENFORCED</div><div className="metric-note">Asset movement disabled</div></div>
    </section>

    <section className="workspace operations-grid">
      <div className="card"><div className="card-title"><span>Experiment Control</span><span className="badge">OPERATOR</span></div>
        <div className="form-grid"><label>Experiment name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Holder concentration study" /></label><label>Module<select value={module} onChange={(e) => setModule(e.target.value)}><option>Security Research</option><option>Replay Lab</option><option>Market Scanner</option><option>Trading Research</option><option>AI Research</option></select></label></div>
        <button className="primary-button" onClick={addExperiment}>Create Experiment</button>{message && <div className="empty-state">{message}</div>}
        <div className="strategy-list">{experiments.length === 0 ? <div className="empty-state">No experiments registered.</div> : experiments.map((experiment) => <div className="strategy-row" key={experiment.id}><div><strong>{experiment.name}</strong><span className="muted">{experiment.module} · {experiment.status}</span></div><div className="strategy-actions"><button className="secondary" onClick={() => toggleExperiment(experiment.id)}>{experiment.status === "RUNNING" ? "Pause" : "Resume"}</button></div></div>)}</div>
      </div>
      <div className="card"><div className="card-title"><span>System Controls</span><span className="badge">SAFE</span></div>
        <div className="list"><div className="list-row"><span className="muted">Research mode</span><strong>{systemMode ? "Operational" : "Paused"}</strong></div><div className="list-row"><span className="muted">Transaction signing</span><strong>Restricted</strong></div><div className="list-row"><span className="muted">Live execution</span><strong>Disabled</strong></div><div className="list-row"><span className="muted">Private key storage</span><strong>Disabled</strong></div></div>
        <button className="secondary primary-button" onClick={() => { setSystemMode((value) => !value); setMessage(systemMode ? "Research mode paused." : "Research mode resumed."); }}> {systemMode ? "Pause Research Mode" : "Resume Research Mode"}</button>
        <button className="secondary primary-button" onClick={clearLab}>Clear Local Operations</button>
      </div>
    </section>

    <section className="card operations-audit"><div className="card-title"><span>Audit Log</span><span className="badge">APPEND-ONLY UI</span></div>{events.slice(0, 20).map((event) => <div className="activity-row" key={event.id}><strong>{event.action}</strong> · {event.target} · {event.actor} · {new Date(event.timestamp).toLocaleString()} <span className="muted">[{event.severity}]</span></div>)}</section>
    <p className="footer-note">Operations Center provides local administrative controls for the research laboratory. It does not grant authority to move assets or perform destructive operations against public-market participants.</p>
  </main>;
}
