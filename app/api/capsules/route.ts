import { getCapsules } from "@/lib/capsules";

// GET /api/capsules?wallet=<address> → that wallet's capsules (newest first).
// Only the outside of the envelope — letters stay hidden until the secret question is answered.
export async function GET(request: Request) {
  const wallet = new URL(request.url).searchParams.get("wallet")?.trim();
  if (!wallet) return Response.json([]);

  const capsules = await getCapsules();
  return Response.json(
    capsules
      .filter((c) => c.walletAddress === wallet)
      .reverse()
      .map((c) => ({
        id: c.id,
        author: c.author,
        unlockDate: c.unlockDate,
        sealedAt: c.sealedAt,
      }))
  );
}
