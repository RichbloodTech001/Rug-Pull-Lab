# Phase 17 — Risk & Fraud Engine

Adds a deterministic defensive transaction-risk engine for research and future server-side controls.

## Added
- Risk scoring and decision engine
- Compliance decision integration
- Daily velocity-limit signal
- Attempt-rate and failed-attempt signals
- New-destination signal
- ALLOW / REVIEW / BLOCK outcomes
- Risk Monitoring Console at `/risk-fraud`

## Production boundary
The current UI is a research simulator. It does not block, seize, reject, or alter real transactions. Production enforcement must run server-side after authentication, compliance screening, authorization, and immutable audit logging.

Risk scores are heuristics, not proof of fraud. Production systems require calibrated rules/models, monitoring, human review, appeals/error handling, privacy controls, and independent validation.
