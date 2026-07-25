import { NextResponse } from "next/server"
import { loadAvailability } from "@/lib/guides/availabilityData"
import { isValidDateKey } from "@/lib/guides/availability"

// Public: the booking calendar resolves availability for anonymous visitors.
// `id` is the guide UUID (BookGuideDialog already holds guide.id).
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(req.url)
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  // Bounded window only — an unbounded query would scan every row for a guide.
  if (!isValidDateKey(from) || !isValidDateKey(to) || from > to) {
    return NextResponse.json({ error: "invalid range" }, { status: 400 })
  }

  const data = await loadAvailability(id, from, to)
  return NextResponse.json(data)
}
