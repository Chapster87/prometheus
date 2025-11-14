import { NextResponse } from "next/server"
import { getSeriesBatch } from "@/server/series"

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
    const categoriesParam = searchParams.get("categories")
    const categories =
      categoriesParam && categoriesParam.trim().length > 0
        ? categoriesParam
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean)
        : ["X"]

    const payload = await getSeriesBatch(categories)

    // Conditional single-category response: unwrap inner object
    const body = categories.length === 1 ? payload[categories[0]] : payload

    return new NextResponse(JSON.stringify(body), {
      headers: {
        "Content-Type": "application/json",
        // CDN caching: 5 min fresh, allow clients to use stale for +10 min while revalidating
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    })
  } catch (error) {
    console.error("Failed to fetch composite series payload:", error)
    return NextResponse.json(
      { error: "Failed to fetch series information." },
      { status: 500 }
    )
  }
}
