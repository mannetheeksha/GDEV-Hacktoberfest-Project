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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#fdf8f0" }}>
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <p className="text-gray-500">Capsule not found or still locked.</p>
          <Link href="/vault" className="mt-4 inline-block underline" style={{ color: "#E21833" }}>
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
    />
  );
}
