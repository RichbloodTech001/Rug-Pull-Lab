# Phase 13 — Payment & Transaction Engine

Phase 13 adds the transaction lifecycle required before external settlement can be connected.

## Added
- Deposit, withdrawal, fee, and adjustment transaction types
- Explicit transaction state machine
- Idempotency key requirement
- Positive integer minor-unit validation
- Fee calculation in integer arithmetic
- Research transaction control console
- Controlled approval/processing/confirmation lifecycle

## State model

`PENDING → PROCESSING → CONFIRMED`

or, where policy requires it:

`PENDING → AWAITING_APPROVAL → PROCESSING → CONFIRMED`

Terminal failure/cancellation states are enforced, and confirmed transactions can only move to `REVERSED` through a separate controlled reversal workflow.

## Production boundary
No bank, payment processor, custody provider, private-key signer, or blockchain broadcast is connected in Phase 13. The UI demonstrates lifecycle rules only. Real settlement requires authenticated server-side authorization, atomic database transactions, compliance/risk controls, and provider-specific webhook verification.

## Next phase
Phase 14 should integrate an institutional custody boundary with policy-controlled signing and provider webhooks, without exposing private keys to the application.
