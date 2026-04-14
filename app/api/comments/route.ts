import { NextResponse, type NextRequest } from "next/server"

import { createComment } from "@/lib/comments/server"
import {
  assertSameOrigin,
  createErrorResponse,
  getIpHash,
  getUserAgent,
} from "@/lib/comments/security"

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request)

    const payload = await request.json()
    await createComment(payload, getIpHash(request), getUserAgent(request))

    return NextResponse.json({ ok: true })
  } catch (error) {
    return createErrorResponse(error)
  }
}
