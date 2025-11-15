import { NextResponse } from "next/server"
import { getMoviesCategories } from "@/server/movies"

/**
 * Movie (VOD) categories endpoint
 * GET /api/movies/categories
 *
 * Returns raw movie categories array.
 * Uses layered caching; applies CDN headers for edge caching.
 */
export async function GET() {
  try {
    const categories = await getMoviesCategories()
    return new NextResponse(JSON.stringify(categories), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    })
  } catch (error) {
    console.error("Failed to fetch movie categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch movie categories." },
      { status: 500 }
    )
  }
}
