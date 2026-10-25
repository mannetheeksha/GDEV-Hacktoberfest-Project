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
    data: new TextEncoder().encode(text),
  });

  const tx = new Transaction().add(memo);
  return sendAndConfirmTransaction(connection, tx, [wallet]);
}

export function explorerTxUrl(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
}
