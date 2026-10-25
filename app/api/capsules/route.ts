import { getCapsules } from "@/lib/capsules";

// Used by /vault to list every capsule (newest first)
export async function GET() {
  const capsules = await getCapsules();
  return Response.json(capsules.reverse());
}
