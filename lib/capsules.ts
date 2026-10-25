import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export type Capsule = {
  id: string;
  author: string;
  walletAddress: string;
  letter: string;
  notes: string;
  photoUrls: string[];
  photoCaptions: string[];
  unlockDate: string;
  hash: string;
  sealTx: string;
  badgeMintAddress?: string;
  sealedAt: string;
  secretQuestion?: string;  // asked before the capsule opens
  answerHash?: string;      // SHA-256 of the answer — the real answer is never stored
};

// What the browser is allowed to see once the capsule is unlocked
export type OpenedCapsule = Omit<Capsule, "answerHash">;

// The capsule's fingerprint: used when sealing AND when verifying, so they always match
export function hashCapsule(letter: string, notes: string): string {
  return crypto.createHash("sha256").update(letter + notes).digest("hex");
}

// "  The Diner " and "the diner" count as the same answer
export function hashAnswer(answer: string): string {
  const cleaned = answer.trim().toLowerCase().replace(/\s+/g, " ");
  return crypto.createHash("sha256").update(cleaned).digest("hex");
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "capsules.json");

export async function getCapsules(): Promise<Capsule[]> {
  try {
    const text = await readFile(DATA_FILE, "utf-8");
    return JSON.parse(text);
  } catch {
    // File doesn't exist yet → no capsules
    return [];
  }
}

export async function getCapsule(id: string): Promise<Capsule | undefined> {
  const capsules = await getCapsules();
  return capsules.find((c) => c.id === id);
}

export async function saveCapsule(capsule: Capsule): Promise<void> {
  const capsules = await getCapsules();
  capsules.push(capsule);
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(capsules, null, 2));
}
