"use client";

import { useMemo, useState } from "react";
import { applyReplayTrade, createReplayState, demoReplay, markReplay, ReplayState } from "@/lib/replay";

export default function ReplayLabPage() {
  const [index, setIndex] = useState(-1);
  const [state, setState] = useState<ReplayState>(() => createReplayState());
  const [qty, setQty] = useState("1");
  const [error, setError] = useState("");
  const candle = index >= 0 ? demoReplay[index] : null;
  const progress = index < 0 ? 0 : ((index + 1) / demoReplay.length) * 100;
  const current = useMemo(() => candle ? markReplay(state, candle) : state, [state, candle]);

  function reset() { setIndex(-1); setState(createReplayState()); setError(""); }
  function step() { if (index + 1 >= demoReplay.length) return; const next = index + 1; setIndex(next); setState((s) => markReplay({ ...s, index: next }, demoReplay[next])); setError(""); }
  function trade(side: "BUY" | "SELL") {
    if (!candle) return;
    try { setState((s) => applyReplayTrade(s, candle, side, Number(qty))); setError(""); } catch (e) { setError(e instanceof Error ? e.message : "Replay trade rejected."); }
  }

  return <main className="main">
    <div className="topbar"><div><div className="eyebrow">Phase 6 · Replay Lab</div><h1>Historical Replay</h1></div><div className="status"><span className="dot" /> DETERMINISTIC PAPER MODE</div></div>
    <section className="grid">
      <div className="card"><div className="metric-label">Replay Progress</div><div className="metric">{progress.toFixed(0)}%</div><div className="metric-note">{index + 1} / {demoReplay.length} candles</div></div>
      <div className="card"><div className="metric-label">Equity</div><div className="metric">${current.equity.toFixed(2)}</div><div className="metric-note">Marked to replay close</div></div>
      <div className="card"><div className="metric-label">Realized P/L</div><div className="metric">${current.realizedPnl.toFixed(2)}</div><div className="metric-note">Replay session</div></div>
      <div className="card"><div className="metric-label">Max Drawdown</div><div className="metric">{current.maxDrawdown.toFixed(2)}%</div><div className="metric-note">Peak-to-trough equity</div></div>
    </section>

    <section className="workspace replay-grid">
      <div className="card"><div className="card-title"><span>Replay Chart</span><span className="badge">SAMPLE DATASET</span></div>
        <div className="replay-chart">{candle ? <><div className="candle-line" style={{ height: `${Math.max(15, Math.min(90, candle.high - candle.low) * 12)}%` }} /><div className="replay-price">${candle.close.toFixed(2)}</div></> : <span>Press Start / Step to begin the deterministic replay</span>}</div>
        <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
        <div className="replay-controls"><button className="primary" onClick={step}>{index < 0 ? "Start replay" : index + 1 >= demoReplay.length ? "Replay complete" : "Next candle"}</button><button className="secondary" onClick={reset}>Reset</button></div>
      </div>
      <div className="card"><div className="card-title"><span>Execution Panel</span><span className="badge">NO REAL FUNDS</span></div>
        <div className="form-grid"><label>Quantity<input type="number" min="0" step="any" value={qty} onChange={(e) => setQty(e.target.value)} /></label><div className="list"><div className="list-row"><span className="muted">Position</span><strong>{current.position.toFixed(4)}</strong></div><div className="list-row"><span className="muted">Cash</span><strong>${current.cash.toFixed(2)}</strong></div><div className="list-row"><span className="muted">Avg entry</span><strong>${current.avgEntry.toFixed(2)}</strong></div></div></div>
        <div className="replay-controls"><button className="primary" disabled={!candle} onClick={() => trade("BUY")}>Paper Buy</button><button className="secondary" disabled={!candle} onClick={() => trade("SELL")}>Paper Sell</button></div>{error && <div className="error-box">{error}</div>}
      </div>
    </section>

    <section className="card"><div className="card-title"><span>Market Event</span><span className="badge">REPLAY TICK</span></div>{candle ? <div className="table-row"><span>OHLC ${candle.open.toFixed(2)} / ${candle.high.toFixed(2)} / ${candle.low.toFixed(2)} / ${candle.close.toFixed(2)}</span><span>Volume {candle.volume.toLocaleString()}</span><span>Liquidity ${candle.liquidity.toFixed(0)} · Holders {candle.holders}</span></div> : <div className="empty-state">No replay event selected.</div>}</section>
    <p className="footer-note">Replay Lab uses deterministic research data and paper accounting. It does not connect to a live DEX or execute trades against public-market participants.</p>
  </main>;
}
