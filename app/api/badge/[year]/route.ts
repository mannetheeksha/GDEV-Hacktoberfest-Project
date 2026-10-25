import { badgeSvg, FIRST_CLASS_YEAR } from "@/lib/badge";

// GET /api/badge/2029 → the badge image for the Class of 2029
export async function GET(_request: Request, { params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  const yearNumber = Number(year);

  if (!Number.isInteger(yearNumber) || yearNumber < FIRST_CLASS_YEAR || yearNumber > 2100) {
    return new Response(`Year must be ${FIRST_CLASS_YEAR} or later`, { status: 400 });
  }

  return new Response(badgeSvg(yearNumber), {
    headers: { "Content-Type": "image/svg+xml" },
  });
}
