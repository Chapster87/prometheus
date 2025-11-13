import { NextResponse } from "next/server"
import { getSeries } from "@/server/series"

export async function GET() {
  try {
    const data = await getSeries()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch series information:", error)
    return NextResponse.json(
      { error: "Failed to fetch series information." },
      { status: 500 }
    )
  }
}
