import { NextResponse } from "next/server"
import { fetchSeriesInfoExternal } from "@/server/spark"

/**
 * Composite series endpoint
 * GET /api/series?categories=A,B,C
 *
 * If categories param omitted defaults to ["X"] (same default as single endpoint).
 * Adds CDN-friendly caching headers while internal layered caching handles freshness.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const seriesId = searchParams.get("id")
    if (seriesId && seriesId.trim().length > 0) {
      const payload = await fetchSeriesInfoExternal(seriesId.trim())
      return new NextResponse(JSON.stringify(payload), {
        headers: {
          "Content-Type": "application/json",
          // CDN caching: 5 min fresh, allow clients to use stale for +10 min while revalidating
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      })
    }
  } catch (error) {
    console.error("Failed to fetch composite series info:", error)
    return NextResponse.json(
      { error: "Failed to fetch series information." },
      { status: 500 }
    )
  }
}
