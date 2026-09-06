export type TriggerType = "PRICE_ABOVE" | "PRICE_BELOW" | "LIQUIDITY_ABOVE" | "LIQUIDITY_BELOW" | "HOLDERS_ABOVE" | "HOLDERS_BELOW";
export type ActionType = "PAPER_BUY" | "PAPER_SELL" | "ALERT";
export type StrategyStatus = "DRAFT" | "ACTIVE" | "PAUSED";

export type MarketSnapshot = { price: number; liquidity: number; holders: number; };
export type StrategyRule = { id: string; trigger: TriggerType; value: number; action: ActionType; quantity?: number; };
export type Strategy = { id: string; name: string; symbol: string; status: StrategyStatus; maxPosition: number; cooldownSeconds: number; rules: StrategyRule[]; createdAt: string; };
export type TriggerResult = { ruleId: string; action: ActionType; reason: string; quantity?: number };

export function evaluateRule(rule: StrategyRule, snapshot: MarketSnapshot): boolean {
  if (!Number.isFinite(rule.value)) return false;
  switch (rule.trigger) {
    case "PRICE_ABOVE": return snapshot.price >= rule.value;
    case "PRICE_BELOW": return snapshot.price <= rule.value;
    case "LIQUIDITY_ABOVE": return snapshot.liquidity >= rule.value;
    case "LIQUIDITY_BELOW": return snapshot.liquidity <= rule.value;
    case "HOLDERS_ABOVE": return snapshot.holders >= rule.value;
    case "HOLDERS_BELOW": return snapshot.holders <= rule.value;
  }
}

export function evaluateStrategy(strategy: Strategy, snapshot: MarketSnapshot, lastTriggeredAt?: number, now = Date.now()): TriggerResult[] {
  if (strategy.status !== "ACTIVE") return [];
  if (lastTriggeredAt && now - lastTriggeredAt < strategy.cooldownSeconds * 1000) return [];
  return strategy.rules.filter((rule) => evaluateRule(rule, snapshot)).map((rule) => ({
    ruleId: rule.id,
    action: rule.action,
    quantity: rule.quantity,
    reason: `${rule.trigger} threshold ${rule.value} reached for ${strategy.symbol}`,
  }));
}

export function createStrategy(input: Omit<Strategy, "id" | "createdAt">): Strategy {
  if (!input.name.trim()) throw new Error("Strategy name is required.");
  if (!input.symbol.trim()) throw new Error("Symbol is required.");
  if (!Number.isFinite(input.maxPosition) || input.maxPosition <= 0) throw new Error("Max position must be greater than zero.");
  if (!Number.isFinite(input.cooldownSeconds) || input.cooldownSeconds < 0) throw new Error("Cooldown cannot be negative.");
  if (input.rules.length === 0) throw new Error("Add at least one trigger rule.");
  return { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
}
