"use client";

import { FormEvent, useState } from "react";
import { getSolanaConnection } from "@/lib/solana";
import { formatTokenAmount, inspectAddress } from "@/lib/market";

export default function MarketScannerPage() {
  const [network, setNetwork] = useState<"devnet" | "localnet">("devnet");
  const [address, setAddress] = useState("");
  const [result, setResult] = useState<Awaited<ReturnType<typeof inspectAddress>> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function scan(event: FormEvent) {
    event.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const value = await inspectAddress(getSolanaConnection(network), address);
      setResult(value);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to inspect this address.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="main">
      <div className="topbar">
        <div><div className="eyebrow">Phase 3 · Market Intelligence</div><h1>Market Scanner</h1></div>
        <div className="status"><span className="dot" /> ON-CHAIN INSPECTION</div>
      </div>

      <section className="card scanner-card">
        <div className="card-title"><span>Address Intelligence</span><span className="badge">READ ONLY</span></div>
        <form className="scanner-form" onSubmit={scan}>
          <label>Network<select value={network} onChange={(e) => setNetwork(e.target.value as "devnet" | "localnet")}><option value="devnet">Solana Devnet</option><option value="localnet">Solana Localnet</option></select></label>
          <label className="address-field">Wallet / account address<input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter a Solana public address" required /></label>
          <button className="primary-button" disabled={loading}>{loading ? "Scanning…" : "Inspect address"}</button>
        </form>
        {error && <div className="error-box">{error}</div>}
      </section>

      {result && <section className="scanner-results">
        <div className="grid">
          <div className="card"><div className="metric-label">SOL Balance</div><div className="metric">{result.solBalance.toFixed(4)}</div><div className="metric-note">Native balance on selected network</div></div>
          <div className="card"><div className="metric-label">Token Accounts</div><div className="metric">{result.tokenAccounts.length}</div><div className="metric-note">Parsed SPL token accounts</div></div>
          <div className="card"><div className="metric-label">Account State</div><div className="metric">{result.accountExists ? "EXISTS" : "EMPTY"}</div><div className="metric-note">Confirmed account lookup</div></div>
          <div className="card"><div className="metric-label">Network</div><div className="metric">{network.toUpperCase()}</div><div className="metric-note">Read-only research scan</div></div>
        </div>

        <div className="card token-table-card">
          <div className="card-title"><span>SPL Holdings</span><span className="badge">{result.address}</span></div>
          {result.tokenAccounts.length === 0 ? <div className="empty-state">No parsed SPL token accounts found.</div> : <div className="token-table"><div className="table-row table-head"><span>Mint</span><span>Balance</span><span>Token account</span></div>{result.tokenAccounts.map((token) => <div className="table-row" key={token.address}><span className="mono">{token.mint}</span><span>{formatTokenAmount(token.amount, token.decimals)}</span><span className="mono">{token.address}</span></div>)}</div>}
        </div>
      </section>}

      <p className="footer-note">Phase 3 provides read-only on-chain intelligence. No trade, liquidity, transfer, or destructive operation is performed by this scanner.</p>
    </main>
  );
}
