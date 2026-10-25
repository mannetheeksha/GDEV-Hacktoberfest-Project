import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  clusterApiUrl,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

// Solana's built-in Memo program: stores a short text message in a transaction
const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

export const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// The server wallet from .env.local (made by `npm run make-wallet`)
export async function getServerWallet(): Promise<Keypair> {
  const secret = process.env.SOLANA_SECRET_KEY;
  if (!secret) {
    throw new Error("SOLANA_SECRET_KEY is missing from .env.local — run `npm run make-wallet`");
  }
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secret)));
}

// Sends a transaction containing `text` as a memo → returns the transaction signature
export async function sendMemo(text: string): Promise<string> {
  const wallet = await getServerWallet();

  const memo = new TransactionInstruction({
    keys: [],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(text, "utf-8"),
  });

  const tx = new Transaction().add(memo);
  return sendAndConfirmTransaction(connection, tx, [wallet]);
}

// Reads a transaction back from Solana → its memo text and when it happened
export async function readMemo(signature: string): Promise<{ memo: string; time: Date } | null> {
  const tx = await connection.getTransaction(signature, {
    maxSupportedTransactionVersion: 0,
    commitment: "confirmed",
  });
  if (!tx || tx.meta?.err || !tx.blockTime) return null;

  // The Memo program logs: Program log: Memo (len 77): "TERP-CAPSULE:abc..."
  const log = tx.meta?.logMessages?.find((l) => l.startsWith("Program log: Memo"));
  const memo = log?.match(/"(.*)"/)?.[1] ?? "";
  return { memo, time: new Date(Number(tx.blockTime) * 1000) };
}

// True if the text is a real Solana address (catches typos and Ethereum 0x... addresses)
export function isValidWallet(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export function explorerTxUrl(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
}
