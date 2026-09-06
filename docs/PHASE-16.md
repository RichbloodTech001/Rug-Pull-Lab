# Phase 16 — KYC/AML & Compliance

Phase 16 adds the defensive compliance policy layer needed before real financial operations.

## Added
- KYC/KYB verification state model
- Sanctions and PEP screening states
- Source-of-funds verification state
- Risk-tier classification
- Transaction screening decisions: ALLOW / REVIEW / BLOCK
- Compliance case lifecycle
- Compliance Control UI

## Production boundary
The laboratory UI is not a KYC provider and does not make regulatory determinations. Production integrations must use appropriate identity, sanctions, PEP, transaction-monitoring, case-management, record-retention, and reporting providers and must be configured for the applicable jurisdiction.

No real-money transaction is approved or settled by this phase.
