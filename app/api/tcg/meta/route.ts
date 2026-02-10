import { NextResponse } from "next/server"
import { fetchMeta } from "@/lib/tcg-api"

export async function GET() {
  try {
    const meta = await fetchMeta()
    return NextResponse.json(meta)
  } catch (err) {
    console.error("TCG API meta error:", err)
    return NextResponse.json({ error: "Failed to fetch meta" }, { status: 502 })
  }
}
