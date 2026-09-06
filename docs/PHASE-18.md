# Phase 18 — Reconciliation

Phase 18 introduces deterministic reconciliation between internal ledger observations and external custody, blockchain, or payment-provider records.

## Added
- Cross-source record comparison
- Reference, asset and amount variance detection
- Missing-counterparty detection
- Duplicate-reference detection
- Reconciliation summary helper
- Controlled exception workflow in the UI

## Production requirements
External records must be independently verified and matched idempotently. Exceptions should create controlled cases rather than silently changing balances. Corrections must use authorized ledger journals with complete audit evidence.

The current page is a research simulator and does not alter balances, settle funds, or perform automated corrective transfers.
