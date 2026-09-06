import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";

export type SolanaNetwork = "devnet" | "localnet";

export function getSolanaRpcUrl(network: SolanaNetwork = "devnet") {
  if (network === "localnet") return "http://127.0.0.1:8899";
  return process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl("devnet");
}

export function getSolanaConnection(network: SolanaNetwork = "devnet") {
  return new Connection(getSolanaRpcUrl(network), "confirmed");
}

export async function getWalletBalance(address: string, network: SolanaNetwork = "devnet") {
  const publicKey = new PublicKey(address);
  const lamports = await getSolanaConnection(network).getBalance(publicKey, "confirmed");
  return lamports / 1_000_000_000;
}

export function explorerAddressUrl(address: string, network: SolanaNetwork = "devnet") {
  const cluster = network === "localnet" ? "custom&customUrl=http%3A%2F%2F127.0.0.1%3A8899" : "devnet";
  return `https://explorer.solana.com/address/${address}?cluster=${cluster}`;
}
