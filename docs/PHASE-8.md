# Phase 8 — AI Research Assistant

Phase 8 adds a defensive research copilot for interpreting laboratory context.

## Capabilities
- Natural-language research questions
- Risk-score interpretation
- Mint/freeze authority explanation
- Holder-concentration guidance
- Strategy and replay research guidance
- Suggested next research actions
- Local deterministic reasoning with supplied context

## Safety boundary
The copilot is intentionally non-executing. It does not move assets, sign transactions, drain liquidity, manipulate public markets, or execute destructive rug-pull operations.

## Future integration
A provider-backed AI service can be connected later through a server-side API boundary. Secrets must remain server-side and must never be committed to the repository.
