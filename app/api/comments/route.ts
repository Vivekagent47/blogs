import { NextResponse, type NextRequest } from "next/server"

import { createComment, getCommentsSectionData } from "@/lib/comments/server"
import {
  assertSameOrigin,
  CommentsApiError,
  createErrorResponse,
  getIpHash,
  getUserAgent,
} from "@/lib/comments/security"

export async function GET(request: NextRequest) {
  try {
    const postSlug = request.nextUrl.searchParams.get("postSlug")?.trim() ?? ""

    if (!postSlug) {
      throw new CommentsApiError(400, "Post slug is required.", "missing_post_slug")
    }

    const data = await getCommentsSectionData(postSlug)
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "private, no-store",
      },
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}

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
