import { NextResponse } from "next/server"
import { getTmdbSeriesInfoRaw } from "@/server/tmdb"

/**
 * TMDB Series (TV show) info endpoint.
 * GET /api/series/tmdb?id=TMDB_ID
 *
 * Uses inner cache only (raw) to avoid double incremental caching since page
 * hydration logic may already prime react-query.
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

    // Fetch raw (inner cached) data.
    const payload = await getTmdbSeriesInfoRaw(id)

    return new NextResponse(JSON.stringify(payload), {
      headers: {
        "Content-Type": "application/json",
        // CDN caching similar to existing series info endpoint.
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    })
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error("Failed TMDB series fetch:", e.message)
    } else {
      console.error("Failed TMDB series fetch:", e)
    }
    return NextResponse.json(
      { error: "Failed to fetch TMDB series info." },
      { status: 500 }
    )
  }
}
