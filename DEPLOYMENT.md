# Production Deployment Checklist

Rug Pull Lab is deployable as a controlled Solana security-research platform. It is **not certified for live custody, production signing, or public-market destructive execution**.

## 1. Required environment

Set these only in the hosting provider's server-side secret/environment configuration:

- `DATABASE_URL` — production PostgreSQL connection string.
- `PLATFORM_CLEARING_ACCOUNT_ID` — only after a controlled platform clearing ledger account exists and has been reviewed.
- `NEXT_PUBLIC_SOLANA_NETWORK=devnet` for the approved research environment.
- `NEXT_PUBLIC_SOLANA_RPC_URL` — trusted Devnet RPC endpoint.

Never commit passwords, API keys, session secrets, seed phrases, private keys, wallet JSON, or provider credentials.

## 2. Database

1. Provision PostgreSQL with encrypted connections and restricted network access.
2. Run Prisma migrations as part of the controlled release process.
3. Create a backup and verify restoration before enabling financial workflows.
4. Configure monitoring for connection failures, latency, storage, and backup freshness.

## 3. Application

1. Deploy the exact Git commit that passed GitHub Actions verification.
2. Use HTTPS and a production hostname.
3. Keep application-held Solana signing disabled.
4. Keep the application on Devnet/Localnet for research operations.
5. Verify `/api/health` returns HTTP 200 and `database: ok` after deployment.

## 4. Security gates

Before any production financial deployment, independently complete:

- MFA/2FA enrollment and verification.
- Email verification and account-recovery controls.
- Rate limiting and abuse protection at the edge/API layer.
- Centralized monitoring and alerting.
- Secret rotation procedures.
- Tested backup/restore and disaster recovery.
- Reconciliation procedures with an approved external source.
- Formal compliance/legal authorization for the intended jurisdiction and product.
- Institutional custody/HSM/MPC integration if real assets will ever be handled.
- Two-person approval for high-risk financial operations.

## 5. Release smoke test

After deployment:

```bash
npm run prisma:validate
npm run test:financial
npm run typecheck
npm run lint
npm run build
```

Then verify registration/login, authorization boundaries, transaction creation, finance approval, compliance review, audit logging, and the health endpoint in the deployed environment.

## 6. Safety boundary

A successful web deployment does not authorize live asset movement. The certification gate must remain blocking until the required custody, compliance, reconciliation, recovery, and operational controls have been independently satisfied.
