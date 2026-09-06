export type Side = "BUY" | "SELL";

export type PaperOrder = {
  id: string;
  side: Side;
  symbol: string;
  quantity: number;
  price: number;
  notional: number;
  createdAt: string;
};

export type PaperPosition = {
  symbol: string;
  quantity: number;
  averageEntry: number;
  realizedPnl: number;
};

export function executePaperOrder(
  order: Omit<PaperOrder, "id" | "notional" | "createdAt">,
  positions: PaperPosition[],
) {
  if (!order.symbol.trim()) throw new Error("Symbol is required.");
  if (!Number.isFinite(order.quantity) || order.quantity <= 0) throw new Error("Quantity must be greater than zero.");
  if (!Number.isFinite(order.price) || order.price <= 0) throw new Error("Price must be greater than zero.");

  const next = positions.map((position) => ({ ...position }));
  const index = next.findIndex((position) => position.symbol === order.symbol);
  const current = index >= 0 ? next[index] : { symbol: order.symbol, quantity: 0, averageEntry: 0, realizedPnl: 0 };

  if (order.side === "BUY") {
    const newQuantity = current.quantity + order.quantity;
    current.averageEntry = newQuantity === 0
      ? 0
      : ((current.quantity * current.averageEntry) + (order.quantity * order.price)) / newQuantity;
    current.quantity = newQuantity;
  } else {
    if (order.quantity > current.quantity) throw new Error("Paper sell exceeds the current position.");
    current.realizedPnl += (order.price - current.averageEntry) * order.quantity;
    current.quantity -= order.quantity;
    if (current.quantity === 0) current.averageEntry = 0;
  }

  if (index >= 0) next[index] = current;
  else next.push(current);

  return {
    order: {
      ...order,
      id: crypto.randomUUID(),
      notional: order.quantity * order.price,
      createdAt: new Date().toISOString(),
    },
    positions: next.filter((position) => position.quantity > 0 || position.realizedPnl !== 0),
  };
}

export function markToMarket(position: PaperPosition, markPrice: number) {
  return (markPrice - position.averageEntry) * position.quantity;
}
