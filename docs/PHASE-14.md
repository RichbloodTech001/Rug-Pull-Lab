# Phase 14 — Institutional Custody Integration

Phase 14 establishes a provider-neutral custody control boundary for future institutional wallet infrastructure.

## Added
- Custody provider abstraction
- Sandbox/production environment distinction
- Explicit signing-disabled policy
- Two-person approval policy
- Destination allowlist requirement
- High-value/manual-review classification
- Custody request policy evaluator
- Custody Control Plane UI

## Security model
The application must never receive unrestricted private keys or seed phrases. A future production integration should use an institutional custody provider with HSM/MPC controls, server-side credentials, verified webhooks, policy enforcement, approval workflows, rate/velocity limits, and complete audit logging.

## Current boundary
The provider is unconfigured, production signing is disabled, and the sandbox evaluator does not broadcast transactions or move assets. This phase therefore does not constitute a live custody service.

## Prerequisites before real funds
- Appropriate legal/regulatory authorization and operating partners
- Production-grade authentication and server-side RBAC
- KYC/AML and transaction monitoring
- Provider account and contractual controls
- Verified webhook ingestion
- Multi-person approval for configured risk tiers
- Reconciliation between provider, blockchain, and internal ledger
- Security review and disaster-recovery testing
