import test from "node:test";
import assert from "node:assert/strict";
import { assertBalanced, calculateBalance, makeIdempotencyKey } from "../lib/ledger.ts";
import { assessTransactionRisk, velocityRemaining } from "../lib/risk-fraud.ts";
import { evaluateTransaction } from "../lib/compliance.ts";

test("double-entry ledger balances by currency", () => {
  const entries = [
    { accountId: "cash", amountMinor: 1000n, currency: "USD", direction: "DEBIT" },
    { accountId: "user", amountMinor: 1000n, currency: "USD", direction: "CREDIT" },
  ];
  const totals = assertBalanced(entries);
  assert.equal(totals.get("USD")?.debit, 1000n);
  assert.equal(totals.get("USD")?.credit, 1000n);
});

test("unbalanced ledger is rejected", () => {
  assert.throws(() => assertBalanced([
    { accountId: "cash", amountMinor: 1000n, currency: "USD", direction: "DEBIT" },
    { accountId: "user", amountMinor: 900n, currency: "USD", direction: "CREDIT" },
  ]), /Unbalanced USD/);
});

test("ledger balance calculation is deterministic", () => {
  const entries = [
    { accountId: "user", amountMinor: 5000n, currency: "USD", direction: "CREDIT" },
    { accountId: "user", amountMinor: 1200n, currency: "USD", direction: "DEBIT" },
    { accountId: "other", amountMinor: 800n, currency: "USD", direction: "DEBIT" },
  ];
  assert.equal(calculateBalance(entries, "user"), -3800n);
});

test("idempotency key requires both scope and request id", () => {
  assert.equal(makeIdempotencyKey("payment", "abc123"), "payment:abc123");
  assert.throws(() => makeIdempotencyKey("", "abc123"), /required/);
});

test("risk scoring blocks compliance blocks", () => {
  const result = assessTransactionRisk({
    amountMinor: 100n,
    dailyVolumeMinor: 0n,
    dailyLimitMinor: 0n,
    recentAttempts: 0,
    failedAttempts: 0,
    destinationNew: false,
    complianceDecision: "BLOCK",
  });
  assert.equal(result.decision, "BLOCK");
  assert.equal(result.score, 100);
});

test("risk scoring reviews elevated activity", () => {
  const result = assessTransactionRisk({
    amountMinor: 100n,
    dailyVolumeMinor: 0n,
    dailyLimitMinor: 0n,
    recentAttempts: 8,
    failedAttempts: 0,
    destinationNew: true,
    complianceDecision: "ALLOW",
  });
  assert.equal(result.decision, "REVIEW");
  assert.ok(result.score >= 40);
});

test("velocity remaining never becomes negative", () => {
  assert.equal(velocityRemaining(1000n, 400n), 600n);
  assert.equal(velocityRemaining(1000n, 1400n), 0n);
});

test("unknown or incomplete compliance state requires review", () => {
  const decision = evaluateTransaction({
    userId: "user-1",
    kyc: "NOT_STARTED",
    kyb: "NOT_STARTED",
    sanctions: "PENDING",
    pep: "PENDING",
    sourceOfFunds: "NOT_STARTED",
    riskTier: "MEDIUM",
  }, { amountMinor: 100n, currency: "USD" });
  assert.equal(decision, "REVIEW");
});

test("prohibited compliance profile is blocked", () => {
  const decision = evaluateTransaction({
    userId: "user-1",
    kyc: "VERIFIED",
    kyb: "NOT_STARTED",
    sanctions: "CLEAR",
    pep: "CLEAR",
    sourceOfFunds: "VERIFIED",
    riskTier: "PROHIBITED",
  }, { amountMinor: 100n, currency: "USD" });
  assert.equal(decision, "BLOCK");
});
