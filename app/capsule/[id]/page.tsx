import Link from "next/link";
import { getCapsule } from "@/lib/capsules";
import OpenCapsule from "./OpenCapsule";

export const instant = false;

export default async function CapsulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const capsule = await getCapsule(id);

  if (!capsule) {
    return (
      <div className="dark-room min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <p className="text-white/70">Capsule not found or still locked.</p>
          <Link href="/vault" className="mt-4 inline-block underline" style={{ color: "#f5d77a" }}>
            Back to vault
          </Link>
        </div>
      </div>
    );
  }

  // Only the outside of the envelope goes to the browser — the letter comes from /api/open
  return (
    <OpenCapsule
      id={capsule.id}
      author={capsule.author}
      secretQuestion={capsule.secretQuestion}
      unlockDate={capsule.unlockDate}
    />
  );
}
