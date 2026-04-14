import { NextResponse, type NextRequest } from "next/server"

import { deleteComment, editComment } from "@/lib/comments/server"
import { assertSameOrigin, createErrorResponse } from "@/lib/comments/security"

type Params = {
  commentId: string
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    assertSameOrigin(request)

    const payload = await request.json()
    const { commentId } = await params
    await editComment(commentId, payload.body)

    return NextResponse.json({ ok: true })
  } catch (error) {
    return createErrorResponse(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    assertSameOrigin(request)

    const { commentId } = await params
    await deleteComment(commentId)

    return NextResponse.json({ ok: true })
  } catch (error) {
    return createErrorResponse(error)
  }
}
