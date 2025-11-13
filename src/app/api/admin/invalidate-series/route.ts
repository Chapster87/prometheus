import { NextResponse } from "next/server"
import { invalidateSeries } from "@/server/series"

/**
 * POST /api/admin/invalidate-series
 * Body (JSON): { "categoryId": "X" } or omit categoryId to invalidate all.
 *
 * Security:
 *  - Requires header: x-admin-token: <ADMIN_TOKEN>
 *  - ADMIN_TOKEN must be set in env. If absent request is rejected.
 */
export async function POST(req: Request) {
  const adminToken = process.env.ADMIN_TOKEN
  if (!adminToken) {
    return NextResponse.json(
      { error: "ADMIN_TOKEN not configured on server" },
      { status: 500 }
    )
  }
  const provided = req.headers.get("x-admin-token")
  if (!provided || provided !== adminToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let categoryId: string | undefined
  try {
    const body = await req.json().catch(() => ({}))
    if (body && typeof body.categoryId === "string") {
      categoryId = body.categoryId.trim() || undefined
    }
  } catch {
    // Ignore malformed JSON; treat as full invalidation
  }

  try {
    await invalidateSeries(categoryId)
    return NextResponse.json(
      { invalidated: categoryId ?? "all" },
      { status: 200 }
    )
  } catch (e) {
    console.error("Invalidate series failed:", e)
    return NextResponse.json(
      { error: "Failed to invalidate series cache" },
      { status: 500 }
    )
  }
}
