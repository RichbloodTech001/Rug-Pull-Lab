"use client";

import { useEffect, useMemo, useState } from "react";
import { createStrategy, evaluateStrategy, MarketSnapshot, Strategy, StrategyRule, TriggerType, ActionType } from "@/lib/strategy-engine";

const STORAGE = "rug-pull-lab:strategies:v1";
const triggerLabels: Record<TriggerType, string> = {
  PRICE_ABOVE: "Price ≥",
  PRICE_BELOW: "Price ≤",
  LIQUIDITY_ABOVE: "Liquidity ≥",
  LIQUIDITY_BELOW: "Liquidity ≤",
  HOLDERS_ABOVE: "Holders ≥",
  HOLDERS_BELOW: "Holders ≤",
};

export default function StrategiesPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [name, setName] = useState("Momentum Research");
  const [symbol, setSymbol] = useState("SOL");
  const [trigger, setTrigger] = useState<TriggerType>("PRICE_ABOVE");
  const [value, setValue] = useState("160");
  const [action, setAction] = useState<ActionType>("PAPER_BUY");
  const [quantity, setQuantity] = useState("1");
  const [snapshot, setSnapshot] = useState<MarketSnapshot>({ price: 165, liquidity: 100000, holders: 500 });
  const [error, setError] = useState("");
  const [events, setEvents] = useState<string[]>([]);

  useEffect(() => {
    try { const raw = localStorage.getItem(STORAGE); if (raw) setStrategies(JSON.parse(raw)); } catch { /* ignore corrupt local research state */ }
  }, []);

  useEffect(() => { localStorage.setItem(STORAGE, JSON.stringify(strategies)); }, [strategies]);

  const activeCount = strategies.filter((s) => s.status === "ACTIVE").length;
  const rulesPreview = useMemo(() => `${triggerLabels[trigger]} ${Number(value) || 0} → ${action}`, [trigger, value, action]);

  function addStrategy() {
    setError("");
    try {
      const rule: StrategyRule = { id: crypto.randomUUID(), trigger, value: Number(value), action, quantity: Number(quantity) };
      const strategy = createStrategy({ name, symbol: symbol.toUpperCase(), status: "DRAFT", maxPosition: 10, cooldownSeconds: 30, rules: [rule] });
      setStrategies((current) => [strategy, ...current]);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to create strategy."); }
  }

  function toggle(id: string) {
    setStrategies((current) => current.map((s) => s.id === id ? { ...s, status: s.status === "ACTIVE" ? "PAUSED" : "ACTIVE" } : s));
  }

  function evaluate(id: string) {
    const strategy = strategies.find((s) => s.id === id); if (!strategy) return;
    const result = evaluateStrategy(strategy, snapshot);
    setEvents((current) => [result.length ? `${strategy.name}: ${result.map((r) => `${r.action} (${r.reason})`).join("; ")}` : `${strategy.name}: no trigger at current snapshot`, ...current].slice(0, 20));
  }

  function clearAll() { setStrategies([]); setEvents([]); localStorage.removeItem(STORAGE); }

  return <main className="main">
    <div className="topbar"><div><div className="eyebrow">Phase 5 · Trigger & Strategy Engine</div><h1>Strategy Lab</h1></div><div className="status"><span className="dot" /> PAPER / RESEARCH ONLY</div></div>

    <section className="grid">
      <div className="card"><div className="metric-label">Strategies</div><div className="metric">{strategies.length}</div><div className="metric-note">Persisted locally</div></div>
      <div className="card"><div className="metric-label">Active</div><div className="metric">{activeCount}</div><div className="metric-note">Trigger evaluation enabled</div></div>
      <div className="card"><div className="metric-label">Snapshot Price</div><div className="metric">${snapshot.price.toFixed(2)}</div><div className="metric-note">Research input</div></div>
      <div className="card"><div className="metric-label">Safety Boundary</div><div className="metric">ISOLATED</div><div className="metric-note">No live DEX execution</div></div>
    </section>

    <section className="workspace strategy-layout">
      <div className="card"><div className="card-title"><span>Strategy Builder</span><span className="badge">LOCAL STATE</span></div>
        <div className="form-grid">
          <label>Strategy name<input value={name} onChange={(e) => setName(e.target.value)} /></label>
          <label>Symbol<input value={symbol} onChange={(e) => setSymbol(e.target.value)} /></label>
          <label>Trigger<select value={trigger} onChange={(e) => setTrigger(e.target.value as TriggerType)}>{Object.entries(triggerLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
          <label>Threshold<input type="number" step="any" value={value} onChange={(e) => setValue(e.target.value)} /></label>
          <label>Action<select value={action} onChange={(e) => setAction(e.target.value as ActionType)}><option value="PAPER_BUY">Paper Buy</option><option value="PAPER_SELL">Paper Sell</option><option value="ALERT">Alert Only</option></select></label>
          <label>Quantity<input type="number" min="0" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></label>
        </div>
        <div className="strategy-preview">Rule preview: <strong>{rulesPreview}</strong></div>
        <button className="primary-button" onClick={addStrategy}>Create research strategy</button>
        {error && <div className="error-box">{error}</div>}
      </div>

      <div className="card"><div className="card-title"><span>Market Snapshot</span><span className="badge">MANUAL TEST DATA</span></div>
        <div className="form-grid">
          <label>Price<input type="number" step="any" value={snapshot.price} onChange={(e) => setSnapshot({ ...snapshot, price: Number(e.target.value) })} /></label>
          <label>Liquidity<input type="number" step="any" value={snapshot.liquidity} onChange={(e) => setSnapshot({ ...snapshot, liquidity: Number(e.target.value) })} /></label>
          <label>Holders<input type="number" step="1" value={snapshot.holders} onChange={(e) => setSnapshot({ ...snapshot, holders: Number(e.target.value) })} /></label>
        </div>
        <p className="muted strategy-help">Use this snapshot to test trigger logic. In later phases it can be replaced by historical or approved Devnet research feeds.</p>
      </div>
    </section>

    <section className="card token-table-card"><div className="card-title"><span>Strategies</span><button className="secondary" onClick={clearAll}>Clear local lab</button></div>
      {strategies.length === 0 ? <div className="empty-state">No strategies yet. Create your first research strategy above.</div> : <div className="strategy-list">{strategies.map((strategy) => <div className="strategy-row" key={strategy.id}><div><strong>{strategy.name}</strong><span className="muted">{strategy.symbol} · {strategy.status} · {strategy.rules.length} rule</span><span className="muted">{strategy.rules.map((r) => `${triggerLabels[r.trigger]} ${r.value} → ${r.action}`).join(" · ")}</span></div><div className="strategy-actions"><button className="secondary" onClick={() => evaluate(strategy.id)}>Evaluate</button><button className="primary" onClick={() => toggle(strategy.id)}>{strategy.status === "ACTIVE" ? "Pause" : "Activate"}</button></div></div>)}</div>}
    </section>

    <section className="card"><div className="card-title"><span>Trigger Activity</span><span className="badge">AUDIT STREAM</span></div>{events.length === 0 ? <div className="empty-state">No evaluations recorded in this session.</div> : <div className="activity-list">{events.map((event, i) => <div className="activity-row" key={`${event}-${i}`}>{event}</div>)}</div>}</section>
    <p className="footer-note">Strategies can generate paper orders or alerts only. They never call a DEX, manipulate public liquidity, drain assets, or execute a live rug-pull operation.</p>
  </main>;
}
