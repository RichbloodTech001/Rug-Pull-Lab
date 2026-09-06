# Phase 12 — PostgreSQL Financial Core

Phase 12 introduces the durable data model for future custody infrastructure.

## Added
- PostgreSQL/Prisma schema
- Users and database-backed identity relationship model
- Financial accounts with asset and status metadata
- Ledger account model
- Journal transaction model with idempotency keys
- Immutable-style ledger entry records
- Audit-event persistence model
- Ledger validation and idempotency primitives
- Server-side `DATABASE_URL` environment template

## Accounting boundary
Financial balances must be derived from posted ledger entries rather than arbitrary client-side balance fields. Ledger amounts use integer minor units (`BigInt`) to avoid floating-point money arithmetic.

A production posting service must execute journal creation and its entries in one database transaction, enforce equal debits and credits for every currency, and reject duplicate idempotency keys.

## Important production note
This phase provides the financial data foundation; it is **not** a live custody system. There is no custody provider, private-key signing, deposit settlement, withdrawal broadcasting, KYC/AML decisioning, or real-money activation.

## Next phase
Phase 13 should add the server-side payment/transaction state machine for deposits, withdrawals, fees, idempotency, and controlled state transitions.
