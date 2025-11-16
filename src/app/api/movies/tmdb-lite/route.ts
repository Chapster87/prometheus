import { NextResponse } from "next/server"
import { getTmdbMovieLiteRaw } from "@/server/tmdb"

/**
 * TMDB Movie lite info endpoint (card enrichment subset).
 * GET /api/movies/tmdb-lite?id=TMDB_ID
 *
 * Uses inner cache only to avoid double incremental caching.
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

    const payload = await getTmdbMovieLiteRaw(id)

    return new NextResponse(JSON.stringify(payload), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    })
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error("Failed TMDB movie lite fetch:", e.message)
    } else {
      console.error("Failed TMDB movie lite fetch:", e)
    }
    return NextResponse.json(
      { error: "Failed to fetch TMDB movie lite info." },
      { status: 500 }
    )
  }
}
