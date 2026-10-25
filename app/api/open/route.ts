import { getCapsule, hashAnswer } from "@/lib/capsules";

// POST { id, answer } → the full capsule, but only if the answer is right
export async function POST(request: Request) {
  const { id, answer } = await request.json();
  const capsule = await getCapsule(id);

  if (!capsule) {
    return Response.json({ error: "Capsule not found" }, { status: 404 });
  }

  // Capsules sealed before secret questions existed have no answer to check
  if (capsule.answerHash && hashAnswer(answer || "") !== capsule.answerHash) {
    return Response.json({ error: "Not quite — Testudo isn't convinced. Try again!" }, { status: 401 });
  }

  const { answerHash, ...opened } = capsule;
  return Response.json(opened);
}
