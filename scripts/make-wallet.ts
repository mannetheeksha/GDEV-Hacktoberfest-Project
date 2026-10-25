// Creates the server wallet that pays for every Solana transaction.
// Run with: npm run make-wallet
import { Keypair } from "@solana/web3.js";

async function main() {
  const wallet = await Keypair.generate();
  const address = wallet.publicKey.toBase58();
  const secret = JSON.stringify(Array.from(wallet.secretKey));

  console.log("\n🐢 New server wallet created!\n");
  console.log("Public address (safe to share):");
  console.log("  " + address + "\n");
  console.log("1) Paste this line into .env.local (KEEP IT SECRET, never commit it):");
  console.log("  SOLANA_SECRET_KEY=" + secret + "\n");
  console.log("2) Get free devnet SOL: go to https://faucet.solana.com, choose Devnet,");
  console.log("   paste the public address above, and request 1–2 SOL.\n");
  console.log("3) Check it arrived:");
  console.log("  https://explorer.solana.com/address/" + address + "?cluster=devnet\n");
}

main();
