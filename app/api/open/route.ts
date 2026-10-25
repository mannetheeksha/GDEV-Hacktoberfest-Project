import { getCapsule, hashAnswer } from "@/lib/capsules";

// POST { id, answer } → the full capsule, but only if the answer is right
export async function POST(request: Request) {
  const { id, answer, skipToGrad } = await request.json();
  const capsule = await getCapsule(id);

  if (!capsule) {
    return Response.json({ error: "Capsule not found" }, { status: 404 });
  }

  // Not graduation day yet (the demo's "Skip to Graduation" button bypasses this)
  if (new Date(capsule.unlockDate).getTime() > Date.now() && !skipToGrad) {
    return Response.json({ error: "This capsule is still sealed until graduation." }, { status: 403 });
  }

  // Capsules sealed before secret questions existed have no answer to check
  if (capsule.answerHash && hashAnswer(answer || "") !== capsule.answerHash) {
    return Response.json({ error: "Not quite — Testudo isn't convinced. Try again!" }, { status: 401 });
  }

  const { answerHash, ...opened } = capsule;
  return Response.json(opened);
}
