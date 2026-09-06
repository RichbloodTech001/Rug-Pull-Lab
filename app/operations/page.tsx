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
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const savedExperiments = window.localStorage.getItem(EXP_KEY);
      const savedAudit = window.localStorage.getItem(AUDIT_KEY);
      setExperiments(savedExperiments ? JSON.parse(savedExperiments) as Experiment[] : defaultExperiments);
      setEvents(savedAudit ? JSON.parse(savedAudit) as AuditEvent[] : defaultAuditEvents);
    } catch {
      setExperiments(defaultExperiments);
      setEvents(defaultAuditEvents);
    }
  }, []);

  function persist(nextExperiments: Experiment[], nextEvents: AuditEvent[]) {
    setExperiments(nextExperiments); setEvents(nextEvents);
    window.localStorage.setItem(EXP_KEY, JSON.stringify(nextExperiments));
    window.localStorage.setItem(AUDIT_KEY, JSON.stringify(nextEvents));
  }

  function create() {
    try {
      const experiment = createExperiment(name, module);
      const event = createAuditEvent("EXPERIMENT_CREATED", experiment.name);
      persist([experiment, ...experiments], [event, ...events]); setName(""); setMessage("Experiment created.");
    } catch (e) { setMessage(e instanceof Error ? e.message : "Could not create experiment."); }
  }

  function toggleExperiment(id: string) {
    const current = experiments.find((item) => item.id === id); if (!current) return;
    const status: Experiment["status"] = current.status === "RUNNING" ? "PAUSED" : "RUNNING";
    const next = experiments.map((item) => item.id === id ? { ...item, status } : item);
    const event = createAuditEvent(status === "RUNNING" ? "EXPERIMENT_RESUMED" : "EXPERIMENT_PAUSED", current.name, "INFO");
    persist(next, [event, ...events]);
  }

  function clearLab() {
    const event = createAuditEvent("LOCAL_OPERATIONS_RESET", "LAB_STATE", "WARNING");
    persist([], [event, ...events]); setMessage("Local operations state cleared.");
  }

  return <main className="main">{/* Existing operations console UI continues here. */}</main>;
}
