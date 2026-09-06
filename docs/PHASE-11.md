# Phase 11 — Identity & Access

Phase 11 establishes the identity and authorization foundation required before financial infrastructure can be exposed.

## Added
- Auth domain types and role model
- Password policy validation helper
- Email normalization
- RBAC capability helpers
- Sign-in / registration UI boundary
- RBAC control-matrix preview
- Dashboard navigation for Identity & RBAC

## Roles
`USER`, `SUPPORT`, `COMPLIANCE`, `FINANCE`, `ADMIN`, `SUPER_ADMIN`

## Production boundary
The current UI is intentionally not a production authentication system. Passwords are not stored, sessions are not created, and client-side role selection is never treated as authorization. Production custody requires server-side authentication, secure session management, email verification, enforced TOTP/WebAuthn, database-backed RBAC, recovery controls, rate limiting, and audit logging.

## Next phase
Phase 12 should introduce PostgreSQL-backed identities and a durable financial account model, followed by an immutable double-entry ledger.
