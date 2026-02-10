import { NextResponse, type NextRequest } from "next/server"
import { fetchCards } from "@/lib/tcg-api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const q = searchParams.get("q") ?? undefined
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : undefined
    const pageSize = searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : undefined
    const orderBy = searchParams.get("orderBy") ?? undefined

    const result = await fetchCards({ q, page, pageSize, orderBy })
    return NextResponse.json(result)
  } catch (err) {
    console.error("TCG API cards error:", err)
    return NextResponse.json({ error: "Failed to fetch cards" }, { status: 502 })
  }
}
