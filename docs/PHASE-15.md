# Phase 15 — Blockchain Settlement

Phase 15 adds a safe settlement state model for blockchain/payment-provider events.

## Added
- Settlement lifecycle state machine
- Devnet/Localnet network boundary
- Confirmation tracking
- Reorg state handling
- Provider-reference and transaction-signature fields
- Settlement record validation
- Settlement Control UI
- Webhook/provider integration requirements

## State lifecycle
`QUEUED → SUBMITTED → CONFIRMING → CONFIRMED`

Exceptional paths include `FAILED` and `REORGED`. Confirmation events must be authenticated and idempotently processed by the future server-side settlement service.

## Security boundary
The browser is never authoritative for blockchain settlement. A production service must independently query or verify the relevant chain/provider event, validate signatures and transaction metadata, enforce idempotency, and only then post the corresponding accounting journal in an atomic database transaction.

This phase does not hold private keys, broadcast transactions, activate production custody, or accept real customer funds.
