# Phase 9 — Admin & Operations Center

Phase 9 centralizes safe laboratory operations.

## Added
- Local experiment registry
- Experiment create/pause/resume controls
- Operations dashboard metrics
- Local audit-event trail
- Research mode pause/resume control
- Safety status indicators
- Local operations reset

## Security boundary
This is an administrative research console, not a financial or asset-custody control plane. Transaction signing remains restricted, private-key storage remains disabled, and destructive public-market operations are not implemented.

## Persistence
Phase 9 currently persists experiment and audit state in the browser's localStorage. A future production deployment can move this state behind authenticated server-side storage with role-based access control and append-only audit persistence.
