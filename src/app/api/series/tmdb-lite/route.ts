import { NextResponse } from "next/server"
import { getTmdbSeriesLiteRaw } from "@/server/tmdb"

/**
 * TMDB Series lite info endpoint (card enrichment subset).
 * GET /api/series/tmdb-lite?id=TMDB_ID
 *
 * Uses inner cache only (raw) to avoid double incremental caching.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")?.trim()
    if (!id) {
      return NextResponse.json(
        { error: "Missing id parameter" },
        { status: 400 }
      )
    }

    const payload = await getTmdbSeriesLiteRaw(id)

    return new NextResponse(JSON.stringify(payload), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    })
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error("Failed TMDB series lite fetch:", e.message)
    } else {
      console.error("Failed TMDB series lite fetch:", e)
    }
    return NextResponse.json(
      { error: "Failed to fetch TMDB series lite info." },
      { status: 500 }
    )
  }
}
