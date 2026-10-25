import { getCapsule, updateCapsule } from "@/lib/capsules";
import { classYear } from "@/lib/badge";
import { mintBadge } from "@/lib/nft";

// Capsules being minted right now — stops a double click from minting two badges
const minting = new Set<string>();

// POST { id } → mints the badge to the capsule's wallet (only once per capsule)
export async function POST(request: Request) {
  const { id } = await request.json();
  const capsule = await getCapsule(id);

  if (!capsule) {
    return Response.json({ error: "Capsule not found" }, { status: 404 });
  }
  if (capsule.badgeMintAddress) {
    return Response.json({ mintAddress: capsule.badgeMintAddress, explorerUrl: explorerUrl(capsule.badgeMintAddress) });
  }
  if (minting.has(id)) {
    return Response.json({ error: "Already minting — hang tight!" }, { status: 409 });
  }

  minting.add(id);
  try {
    const mintAddress = await mintBadge(capsule.walletAddress, classYear(capsule.unlockDate));
    await updateCapsule(id, { badgeMintAddress: mintAddress });
    return Response.json({ mintAddress, explorerUrl: explorerUrl(mintAddress) });
  } catch (err) {
    console.error("Badge mint failed:", err);
    return Response.json({ error: "Testudo dropped the badge — refresh to try again." }, { status: 500 });
  } finally {
    minting.delete(id);
  }
}

function explorerUrl(mintAddress: string) {
  return `https://explorer.solana.com/address/${mintAddress}?cluster=devnet`;
}
