import { getCapsule, hashCapsule } from "@/lib/capsules";
import { readMemo } from "@/lib/solana";

// POST { id } → { verified, sealedAt } by comparing the capsule's fingerprint with Solana
export async function POST(request: Request) {
  const { id } = await request.json();
  const capsule = await getCapsule(id);

  if (!capsule) {
    return Response.json({ error: "Capsule not found" }, { status: 404 });
  }
  if (!capsule.sealTx) {
    return Response.json({ verified: false, reason: "This capsule was never recorded on Solana." });
  }

  // 1. Re-make the fingerprint from what's in our JSON file right now
  const hashNow = hashCapsule(capsule.letter, capsule.notes);

  // 2. Read the fingerprint that was written on Solana at sealing time
  let onChain;
  try {
    onChain = await readMemo(capsule.sealTx);
  } catch (err) {
    console.error("Solana read failed:", err);
    return Response.json({ error: "Couldn't reach Solana — try again." }, { status: 503 });
  }
  if (!onChain) {
    return Response.json({ verified: false, reason: "The seal transaction wasn't found on Solana." });
  }

  // 3. Compare
  const verified = onChain.memo === `TERP-CAPSULE:${hashNow}`;
  return Response.json({
    verified,
    sealedAt: onChain.time.toISOString(), // Solana's clock, not ours — can't be backdated
    reason: verified ? undefined : "The letter or notes changed after sealing.",
  });
}
