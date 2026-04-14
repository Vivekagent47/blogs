import { NextResponse, type NextRequest } from "next/server"

import { reportComment } from "@/lib/comments/server"
import { assertSameOrigin, createErrorResponse } from "@/lib/comments/security"

type Params = {
  commentId: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    assertSameOrigin(request)

    const payload = await request.json()
    const { commentId } = await params
    await reportComment(commentId, payload.reason, payload.details)

    return NextResponse.json({ ok: true })
  } catch (error) {
    return createErrorResponse(error)
  }
}
