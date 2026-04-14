import { createHash } from "node:crypto"

import { NextResponse, type NextRequest } from "next/server"

export class CommentsApiError extends Error {
  code: string
  status: number

  constructor(status: number, message: string, code = "comments_error") {
    super(message)
    this.code = code
    this.status = status
  }
}

export function assertSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin")
  if (!origin) {
    return
  }

  if (origin !== request.nextUrl.origin) {
    throw new CommentsApiError(403, "Cross-site requests are not allowed.", "csrf_blocked")
  }
}

export function getIpHash(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")
  const candidate =
    forwardedFor?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip")?.trim() ??
    request.headers.get("x-vercel-proxied-for")?.trim() ??
    null

  if (!candidate) {
    return null
  }

  return createHash("sha256").update(candidate).digest("hex")
}

export function getUserAgent(request: NextRequest) {
  return request.headers.get("user-agent")?.slice(0, 512) ?? null
}

export function sanitizeNextPath(input: string | null | undefined, fallback = "/") {
  if (!input || !input.startsWith("/") || input.startsWith("//")) {
    return fallback
  }

  return input
}

export function createErrorResponse(error: unknown) {
  if (error instanceof CommentsApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status },
    )
  }

  console.error(error)

  return NextResponse.json(
    { error: "Something went wrong while processing your request.", code: "internal_error" },
    { status: 500 },
  )
}
