import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export type TokenAccountSnapshot = {
  address: string;
  mint: string;
  owner: string;
  amount: string;
  decimals: number;
};

export async function inspectAddress(connection: Connection, address: string) {
  const publicKey = new PublicKey(address.trim());
  const [balance, accountInfo, tokenAccounts] = await Promise.all([
    connection.getBalance(publicKey, "confirmed"),
    connection.getAccountInfo(publicKey, "confirmed"),
    connection.getParsedTokenAccountsByOwner(publicKey, { programId: TOKEN_PROGRAM_ID }, "confirmed"),
  ]);

  const tokens: TokenAccountSnapshot[] = tokenAccounts.value.map(({ pubkey, account }) => {
    const info = account.data.parsed.info;
    return {
      address: pubkey.toBase58(),
      mint: info.mint,
      owner: info.owner,
      amount: info.tokenAmount.amount,
      decimals: info.tokenAmount.decimals,
    };
  });

  return {
    address: publicKey.toBase58(),
    solBalance: balance / 1_000_000_000,
    accountExists: Boolean(accountInfo),
    tokenAccounts: tokens,
  };
}

export function formatTokenAmount(raw: string, decimals: number) {
  const value = Number(raw) / 10 ** decimals;
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: Math.min(decimals, 6) }).format(value);
}
