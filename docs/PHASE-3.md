# Phase 3 — Market Intelligence

Phase 3 adds a read-only on-chain intelligence layer for Solana research.

## Included

- Devnet and Localnet selection
- Public-address inspection
- Native SOL balance lookup
- SPL token-account discovery
- Parsed token balances and decimals
- Account existence checks
- Explicit read-only research boundary

## Safety boundary

The scanner does not execute trades, move assets, alter liquidity, freeze unrelated accounts, or perform destructive operations. Production/public-mainnet market manipulation is outside the scope of this laboratory.

## Next work

Phase 4 will build the Trading Research Terminal around this data: historical observations, chart-ready datasets, paper execution, portfolio accounting, and research analytics.
