"use client";

import { useEffect, useMemo, useState } from "react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { createResearchToken } from "@/lib/token-lab";
import { getSolanaConnection, getSolanaRpcUrl, SolanaNetwork, explorerAddressUrl } from "@/lib/solana";

type PhantomProvider = {
  isPhantom?: boolean;
  publicKey?: PublicKey;
  connect: () => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
};

type TokenRecord = {
  name: string;
  symbol: string;
  mint: string;
  tokenAccount: string;
  signature: string;
  network: SolanaNetwork;
  createdAt: string;
};

const HISTORY_KEY = "rug-pull-lab.token-history.v1";

function getProvider(): PhantomProvider | null {
  if (typeof window === "undefined") return null;
  const provider = (window as Window & { solana?: PhantomProvider }).solana;
  return provider?.isPhantom ? provider : null;
}

export default function TokenCreator() {
  const [network, setNetwork] = useState<SolanaNetwork>("devnet");
  const [provider, setProvider] = useState<PhantomProvider | null>(null);
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [name, setName] = useState("Research Token");
  const [symbol, setSymbol] = useState("RSL");
  const [decimals, setDecimals] = useState(9);
  const [supply, setSupply] = useState("1000000");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [history, setHistory] = useState<TokenRecord[]>([]);

  const connection = useMemo(() => getSolanaConnection(network), [network]);
  const rpcUrl = getSolanaRpcUrl(network);

  useEffect(() => {
    setProvider(getProvider());
    try {
      const stored = window.localStorage.getItem(HISTORY_KEY);
      setHistory(stored ? JSON.parse(stored) : []);
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    setBalance(null);
    if (!address) return;
    let cancelled = false;
    void connection.getBalance(new PublicKey(address), "confirmed").then((lamports) => {
      if (!cancelled) setBalance(lamports / 1_000_000_000);
    }).catch(() => {
      if (!cancelled) setBalance(null);
    });
    return () => { cancelled = true; };
  }, [address, connection]);

  async function connectWallet() {
    setError("");
    setNotice("");
    const wallet = getProvider();
    if (!wallet) {
      setError("Phantom wallet was not detected. Install Phantom and enable Devnet for this lab.");
      return;
    }
    try {
      const result = await wallet.connect();
      setProvider(wallet);
      setAddress(result.publicKey.toBase58());
      setNotice("Wallet connected.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wallet connection was rejected.");
    }
  }

  async function disconnectWallet() {
    try { await provider?.disconnect(); } catch { /* wallet may already be disconnected */ }
    setAddress("");
    setBalance(null);
    setNotice("Wallet disconnected.");
  }

  async function createToken() {
    setError("");
    setNotice("");
    if (!provider?.publicKey || !address) {
      setError("Connect a Phantom wallet before creating a research token.");
      return;
    }
    setBusy(true);
    try {
      const result = await createResearchToken(connection, provider, {
        name,
        symbol,
        decimals,
        supply,
      });
      const record: TokenRecord = {
        name: name.trim(),
        symbol: symbol.trim().toUpperCase(),
        ...result,
        network,
        createdAt: new Date().toISOString(),
      };
      const next = [record, ...history].slice(0, 20);
      setHistory(next);
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      setNotice(`Token created successfully: ${result.mint}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Token creation failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="token-lab">
      <section className="card">
        <div className="card-title">
          <span>Token Lab</span>
          <span className="badge">{network.toUpperCase()} · SAFE RESEARCH</span>
        </div>
        <p className="muted token-intro">Create real SPL research tokens on Devnet or Localnet. No private keys are stored by this application.</p>

        <div className="form-grid">
          <label>Network<select value={network} onChange={(e) => setNetwork(e.target.value as SolanaNetwork)}><option value="devnet">Solana Devnet</option><option value="localnet">Solana Localnet</option></select></label>
          <label>Token name<input value={name} maxLength={32} onChange={(e) => setName(e.target.value)} /></label>
          <label>Symbol<input value={symbol} maxLength={10} onChange={(e) => setSymbol(e.target.value.toUpperCase())} /></label>
          <label>Decimals<input type="number" min={0} max={9} value={decimals} onChange={(e) => setDecimals(Number(e.target.value))} /></label>
          <label className="wide">Initial supply<input inputMode="decimal" value={supply} onChange={(e) => setSupply(e.target.value)} /></label>
        </div>

        <div className="wallet-panel">
          <div><span className="muted">Wallet</span><strong>{address ? `${address.slice(0, 6)}…${address.slice(-6)}` : "Not connected"}</strong></div>
          <div><span className="muted">SOL balance</span><strong>{balance === null ? "—" : `${balance.toFixed(4)} SOL`}</strong></div>
          {!address ? <button className="primary" onClick={connectWallet}>Connect Phantom</button> : <button className="secondary" onClick={disconnectWallet}>Disconnect</button>}
        </div>

        {error && <div className="alert error">{error}</div>}
        {notice && <div className="alert success">{notice}</div>}

        <button className="primary create-button" disabled={busy || !address} onClick={createToken}>
          {busy ? "Creating & confirming…" : "Create Research Token"}
        </button>
        <div className="footer-note">RPC: {rpcUrl} · Mint authority is the connected wallet; freeze authority is disabled by default.</div>
      </section>

      <section className="card">
        <div className="card-title"><span>Recent Token Experiments</span><span className="badge">LOCAL HISTORY</span></div>
        {history.length === 0 ? <p className="muted">No tokens created from this browser yet.</p> : <div className="list">{history.map((item) => <div className="history-row" key={item.signature}><div><strong>{item.name} ({item.symbol})</strong><span className="muted">{item.network.toUpperCase()} · {new Date(item.createdAt).toLocaleString()}</span></div><div className="history-links"><a href={explorerAddressUrl(item.mint, item.network)} target="_blank" rel="noreferrer">Mint</a><a href={`https://explorer.solana.com/tx/${item.signature}?cluster=${item.network === "localnet" ? "custom&customUrl=http%3A%2F%2F127.0.0.1%3A8899" : "devnet"}`} target="_blank" rel="noreferrer">Tx</a></div></div>)}</div>}
      </section>
    </div>
  );
}
