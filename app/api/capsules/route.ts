import { getCapsules } from "@/lib/capsules";

// Used by /vault to list every capsule (newest first).
// Only the outside of the envelope — letters stay hidden until the secret question is answered.
export async function GET() {
  const capsules = await getCapsules();
  return Response.json(
    capsules.reverse().map((c) => ({
      id: c.id,
      author: c.author,
      unlockDate: c.unlockDate,
      sealedAt: c.sealedAt,
    }))
  );
}
