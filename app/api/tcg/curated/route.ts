import { NextResponse } from "next/server"
import { fetchCuratedCards } from "@/lib/tcg-api"

export async function GET() {
  try {
    const result = await fetchCuratedCards()
    return NextResponse.json(result)
  } catch (err) {
    console.error("TCG API curated error:", err)
    return NextResponse.json(
      { cards: [], windowKey: -1, error: "Curated cards are temporarily unavailable. Please try again later." },
      { status: 503 }
    )
  }
}
