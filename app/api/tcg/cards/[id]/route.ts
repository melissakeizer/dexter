import { NextResponse } from "next/server"
import { fetchCardById } from "@/lib/tcg-api"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const card = await fetchCardById(id)
    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 })
    }
    return NextResponse.json({ card })
  } catch (err) {
    console.error("TCG API card error:", err)
    return NextResponse.json({ error: "Failed to fetch card" }, { status: 502 })
  }
}
