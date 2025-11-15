import { NextResponse } from "next/server"
import { getMoviesBatch } from "@/server/movies"

/**
 * Composite movies (VOD) endpoint
 * GET /api/movies?categories=A,B,C
 *
 * If categories param omitted defaults to ["X"] (same default as single retrieval).
 * Adds CDN-friendly caching headers while inner layered caching manages freshness.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const categoriesParam = searchParams.get("categories")
    const categories =
      categoriesParam && categoriesParam.trim().length > 0
        ? categoriesParam
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean)
        : ["X"]

    const payload = await getMoviesBatch(categories)
    const body = categories.length === 1 ? payload[categories[0]] : payload

    return new NextResponse(JSON.stringify(body), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    })
  } catch (error) {
    console.error("Failed to fetch composite movies payload:", error)
    return NextResponse.json(
      { error: "Failed to fetch movies information." },
      { status: 500 }
    )
  }
}
