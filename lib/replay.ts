export type ReplayCandle = { time: number; open: number; high: number; low: number; close: number; volume: number; liquidity: number; holders: number };
export type ReplayState = { index: number; cash: number; position: number; avgEntry: number; realizedPnl: number; equity: number; maxEquity: number; maxDrawdown: number };

export const demoReplay: ReplayCandle[] = Array.from({ length: 60 }, (_, i) => {
  const base = 145 + Math.sin(i / 5) * 7 + i * 0.22;
  const open = base + Math.sin(i * 1.7) * 1.2;
  const close = base + Math.cos(i * 1.3) * 1.5;
  return { time: 1_750_000_000 + i * 300, open, high: Math.max(open, close) + 1.8, low: Math.min(open, close) - 1.8, close, volume: 50_000 + i * 850, liquidity: 100_000 + Math.sin(i / 8) * 12_000, holders: Math.round(420 + i * 3 + Math.sin(i / 4) * 9) };
});

export function createReplayState(cash = 10_000): ReplayState {
  return { index: -1, cash, position: 0, avgEntry: 0, realizedPnl: 0, equity: cash, maxEquity: cash, maxDrawdown: 0 };
}

export function markReplay(state: ReplayState, candle: ReplayCandle): ReplayState {
  const equity = state.cash + state.position * candle.close;
  const maxEquity = Math.max(state.maxEquity, equity);
  const drawdown = maxEquity > 0 ? ((maxEquity - equity) / maxEquity) * 100 : 0;
  return { ...state, equity, maxEquity, maxDrawdown: Math.max(state.maxDrawdown, drawdown) };
}

export function applyReplayTrade(state: ReplayState, candle: ReplayCandle, side: "BUY" | "SELL", quantity: number): ReplayState {
  if (!Number.isFinite(quantity) || quantity <= 0) throw new Error("Quantity must be greater than zero.");
  if (side === "BUY") {
    const cost = quantity * candle.close;
    if (cost > state.cash) throw new Error("Insufficient replay cash.");
    const total = state.position + quantity;
    const avgEntry = total === 0 ? 0 : ((state.position * state.avgEntry) + cost) / total;
    return markReplay({ ...state, index: state.index, cash: state.cash - cost, position: total, avgEntry }, candle);
  }
  if (quantity > state.position) throw new Error("Replay sell exceeds current position.");
  const proceeds = quantity * candle.close;
  const realizedPnl = state.realizedPnl + (candle.close - state.avgEntry) * quantity;
  const position = state.position - quantity;
  return markReplay({ ...state, cash: state.cash + proceeds, position, realizedPnl, avgEntry: position === 0 ? 0 : state.avgEntry }, candle);
}

export function runReplay(candles: ReplayCandle[], initialCash = 10_000) {
  let state = createReplayState(initialCash);
  for (let i = 0; i < candles.length; i++) {
    state = markReplay({ ...state, index: i }, candles[i]);
  }
  return state;
}
