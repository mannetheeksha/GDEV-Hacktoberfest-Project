import crypto from "crypto";
import { saveCapsule, hashAnswer, hashCapsule, type Capsule } from "@/lib/capsules";
import { sendMemo, explorerTxUrl } from "@/lib/solana";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.author || !body.walletAddress || !body.letter) {
    return Response.json({ error: "Name, wallet address and letter are required" }, { status: 400 });
  }
  if (!body.secretQuestion?.trim() || !body.secretAnswer?.trim()) {
    return Response.json({ error: "Please choose a secret question and answer it" }, { status: 400 });
  }

  const notes = body.notes || "";
  const hash = hashCapsule(body.letter, notes);

  // Record the hash on Solana so nobody can edit or backdate the capsule
  let sealTx: string;
  try {
    sealTx = await sendMemo(`TERP-CAPSULE:${hash}`);
  } catch (err) {
    console.error("Solana memo failed:", err);
    return Response.json({ error: "Solana didn't answer — please try sealing again." }, { status: 500 });
  }

  const capsule: Capsule = {
    id: crypto.randomUUID().slice(0, 8),
    author: body.author,
    walletAddress: body.walletAddress,
    letter: body.letter,
    notes,
    photoUrls: body.photoUrls || [],
    photoCaptions: body.photoCaptions || [],
    unlockDate: body.unlockDate || "2029-05-20",
    hash,
    sealTx,
    sealedAt: new Date().toISOString(),
    secretQuestion: body.secretQuestion.trim(),
    answerHash: hashAnswer(body.secretAnswer),
  };

  await saveCapsule(capsule);

  return Response.json({ id: capsule.id, sealTx, explorerUrl: explorerTxUrl(sealTx) });
}
