import { type EmailOtpType } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"

import { createSupabaseServerClient } from "@/lib/supabase/server"

function resolveRedirectPath(request: NextRequest) {
  const redirectTo = request.nextUrl.searchParams.get("redirect_to")
  if (!redirectTo) {
    return "/"
  }

  try {
    const url = new URL(redirectTo)

    if (url.origin !== request.nextUrl.origin) {
      return "/"
    }

    return `${url.pathname}${url.search}`
  } catch {
    return "/"
  }
}

function redirectWithNotice(
  request: NextRequest,
  nextPath: string,
  notice: string
) {
  const url = request.nextUrl.clone()
  url.pathname = nextPath
  url.searchParams.set("comments_notice", notice)
  url.searchParams.delete("token_hash")
  url.searchParams.delete("type")
  url.searchParams.delete("redirect_to")
  return NextResponse.redirect(url)
}

export async function GET(request: NextRequest) {
  const tokenHash =
    request.nextUrl.searchParams.get("token_hash") ??
    request.nextUrl.searchParams.get("token")
  const rawType = request.nextUrl.searchParams.get("type")
  const type = (
    rawType === "magiclink" ? "email" : rawType
  ) as EmailOtpType | null
  const nextPath = resolveRedirectPath(request)

  if (!tokenHash || !type) {
    console.error("Supabase verifyOtp request missing params", {
      hasCode: Boolean(request.nextUrl.searchParams.get("code")),
      hasRedirectTo: Boolean(request.nextUrl.searchParams.get("redirect_to")),
      hasToken: Boolean(request.nextUrl.searchParams.get("token")),
      hasTokenHash: Boolean(request.nextUrl.searchParams.get("token_hash")),
      nextPath,
      rawType,
    })
    return redirectWithNotice(request, nextPath, "auth-failed")
  }

  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    return redirectWithNotice(request, nextPath, "comments-offline")
  }

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  })

  if (error) {
    console.error("Supabase verifyOtp failed", {
      code: error.code,
      hasRedirectTo: Boolean(request.nextUrl.searchParams.get("redirect_to")),
      hasTokenHash: Boolean(tokenHash),
      message: error.message,
      nextPath,
      rawType,
      status: error.status,
      type,
    })
    return redirectWithNotice(request, nextPath, "auth-failed")
  }

  return redirectWithNotice(request, nextPath, "signed-in")
}
