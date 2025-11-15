import { NextResponse } from "next/server"
import { getSeriesCategories } from "@/server/series"

/**
 * Series categories endpoint
 * GET /api/series/categories
 *
 * Returns raw categories array.
 * Applies CDN caching headers; freshness controlled by internal layered caches.
 */
export async function GET() {
  try {
    const categories = await getSeriesCategories()
    return new NextResponse(JSON.stringify(categories), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    })
  } catch (error) {
    console.error("Failed to fetch series categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch series categories." },
      { status: 500 }
    )
  }
}
