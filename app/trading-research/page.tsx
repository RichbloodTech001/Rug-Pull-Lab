"use client";

import { useMemo, useState } from "react";
import { executePaperOrder, markToMarket, PaperPosition, Side } from "@/lib/paper-trading";

const initialPositions: PaperPosition[] = [];

export default function TradingResearchPage() {
  const [symbol, setSymbol] = useState("SOL");
  const [side, setSide] = useState<Side>("BUY");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("150");
  const [positions, setPositions] = useState<PaperPosition[]>(initialPositions);
  const [orders, setOrders] = useState<ReturnType<typeof executePaperOrder>["order"][]>([]);
  const [error, setError] = useState("");

  const unrealized = useMemo(() => positions.reduce((sum, position) => sum + markToMarket(position, Number(price) || 0), 0), [positions, price]);
  const realized = positions.reduce((sum, position) => sum + position.realizedPnl, 0);

  function submit() {
    setError("");
    try {
      const result = executePaperOrder({ side, symbol: symbol.trim().toUpperCase(), quantity: Number(quantity), price: Number(price) }, positions);
      setPositions(result.positions);
      setOrders((current) => [result.order, ...current].slice(0, 25));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Paper order rejected.");
    }
  }

  return <main className="main">
    <div className="topbar"><div><div className="eyebrow">Phase 4 · Trading Research</div><h1>Research Terminal</h1></div><div className="status"><span className="dot" /> PAPER EXECUTION</div></div>
    <section className="grid">
      <div className="card"><div className="metric-label">Open Positions</div><div className="metric">{positions.length}</div><div className="metric-note">Research portfolio</div></div>
      <div className="card"><div className="metric-label">Realized P/L</div><div className="metric">${realized.toFixed(2)}</div><div className="metric-note">Closed paper trades</div></div>
      <div className="card"><div className="metric-label">Unrealized P/L</div><div className="metric">${unrealized.toFixed(2)}</div><div className="metric-note">Marked at current price</div></div>
      <div className="card"><div className="metric-label">Orders</div><div className="metric">{orders.length}</div><div className="metric-note">Local research session</div></div>
    </section>

    <section className="workspace terminal-grid">
      <div className="card"><div className="card-title"><span>Paper Order Ticket</span><span className="badge">NO REAL FUNDS</span></div>
        <div className="order-form">
          <label>Symbol<input value={symbol} onChange={(e) => setSymbol(e.target.value)} /></label>
          <label>Side<select value={side} onChange={(e) => setSide(e.target.value as Side)}><option>BUY</option><option>SELL</option></select></label>
          <label>Quantity<input type="number" min="0" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></label>
          <label>Price<input type="number" min="0" step="any" value={price} onChange={(e) => setPrice(e.target.value)} /></label>
          <button className="primary-button" onClick={submit}>Submit paper order</button>
        </div>
        {error && <div className="error-box">{error}</div>}
      </div>
      <div className="card"><div className="card-title"><span>Chart Workspace</span><span className="badge">RESEARCH DATA</span></div><div className="chart">Historical price-series adapter reserved for market feeds</div></div>
    </section>

    <section className="card token-table-card"><div className="card-title"><span>Portfolio</span><span className="badge">SESSION STATE</span></div>
      {positions.length === 0 ? <div className="empty-state">No open paper positions.</div> : <div className="token-table"><div className="table-row table-head"><span>Symbol</span><span>Quantity</span><span>Avg entry · P/L</span></div>{positions.map((position) => <div className="table-row" key={position.symbol}><strong>{position.symbol}</strong><span>{position.quantity}</span><span>${position.averageEntry.toFixed(2)} · ${position.realizedPnl.toFixed(2)}</span></div>)}</div>}
    </section>
    <p className="footer-note">All execution on this terminal is simulated in the browser. It does not submit trades to a DEX or move real assets.</p>
  </main>;
}
