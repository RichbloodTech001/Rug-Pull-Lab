import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

export type WalletSigner = {
  publicKey: PublicKey;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
};

export type TokenCreationInput = {
  name: string;
  symbol: string;
  decimals: number;
  supply: string;
};

export type TokenCreationResult = {
  mint: string;
  tokenAccount: string;
  signature: string;
};

function validateInput(input: TokenCreationInput) {
  const name = input.name.trim();
  const symbol = input.symbol.trim().toUpperCase();

  if (name.length < 1 || name.length > 32) throw new Error("Token name must be 1–32 characters.");
  if (!/^[A-Z0-9]{1,10}$/.test(symbol)) throw new Error("Symbol must be 1–10 letters or numbers.");
  if (!Number.isInteger(input.decimals) || input.decimals < 0 || input.decimals > 9) {
    throw new Error("Decimals must be an integer from 0 to 9.");
  }
  if (!/^\d+(\.\d+)?$/.test(input.supply) || Number(input.supply) <= 0) {
    throw new Error("Supply must be a positive number.");
  }

  const [whole, fraction = ""] = input.supply.split(".");
  if (fraction.length > input.decimals) {
    throw new Error(`Supply has more than ${input.decimals} decimal places.`);
  }

  const raw = `${whole}${fraction.padEnd(input.decimals, "0")}`.replace(/^0+(?=\d)/, "");
  if (BigInt(raw || "0") > 18446744073709551615n) {
    throw new Error("Supply exceeds the SPL Token u64 limit.");
  }

  return { name, symbol, rawAmount: BigInt(raw || "0") };
}

export async function createResearchToken(
  connection: Connection,
  wallet: WalletSigner,
  input: TokenCreationInput,
): Promise<TokenCreationResult> {
  const { rawAmount } = validateInput(input);
  const mint = Keypair.generate();
  const tokenAccount = await getAssociatedTokenAddress(mint.publicKey, wallet.publicKey);
  const rent = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");

  const transaction = new Transaction({
    feePayer: wallet.publicKey,
    recentBlockhash: blockhash,
  }).add(
    SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: mint.publicKey,
      lamports: rent,
      space: MINT_SIZE,
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeMintInstruction(mint.publicKey, input.decimals, wallet.publicKey, null),
    createAssociatedTokenAccountInstruction(
      wallet.publicKey,
      tokenAccount,
      wallet.publicKey,
      mint.publicKey,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    ),
    createMintToInstruction(mint.publicKey, tokenAccount, wallet.publicKey, rawAmount),
  );

  transaction.partialSign(mint);
  const signed = await wallet.signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signed.serialize(), {
    skipPreflight: false,
    preflightCommitment: "confirmed",
    maxRetries: 3,
  });

  await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    "confirmed",
  );

  return {
    mint: mint.publicKey.toBase58(),
    tokenAccount: tokenAccount.toBase58(),
    signature,
  };
}
