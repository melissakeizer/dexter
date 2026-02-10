import { NextResponse } from "next/server"
import { fetchSets } from "@/lib/tcg-api"

export async function GET() {
  try {
    const sets = await fetchSets()
    return NextResponse.json({ sets })
  } catch (err) {
    console.error("TCG API sets error:", err)
    return NextResponse.json({ error: "Failed to fetch sets" }, { status: 502 })
  }
}
