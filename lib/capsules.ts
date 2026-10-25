import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

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
};

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
