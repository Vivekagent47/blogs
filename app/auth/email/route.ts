import { NextResponse, type NextRequest } from "next/server"

import { CommentsApiError, assertSameOrigin, sanitizeNextPath } from "@/lib/comments/security"
import { getCommentsRedirectBaseUrl } from "@/lib/supabase/env"
import { createSupabaseServerClient } from "@/lib/supabase/server"

function redirectWithNotice(request: NextRequest, nextPath: string, notice: string) {
  const redirectUrl = request.nextUrl.clone()
  redirectUrl.pathname = nextPath
  redirectUrl.searchParams.set("comments_notice", notice)
  return NextResponse.redirect(redirectUrl)
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request)

    const formData = await request.formData()
    const email = typeof formData.get("email") === "string" ? String(formData.get("email")).trim() : ""
    const nextPath = sanitizeNextPath(
      typeof formData.get("next") === "string" ? String(formData.get("next")) : null,
      "/",
    )

    if (!email) {
      throw new CommentsApiError(400, "Email is required.", "email_required")
    }

    const supabase = await createSupabaseServerClient()
    if (!supabase) {
      return redirectWithNotice(request, nextPath, "comments-offline")
    }

    const redirectTarget = new URL(nextPath, getCommentsRedirectBaseUrl())

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTarget.toString(),
      },
    })

    if (error) {
      throw new CommentsApiError(400, error.message, "magic_link_failed")
    }

    return redirectWithNotice(request, nextPath, "magic-link-sent")
  } catch (error) {
    if (error instanceof CommentsApiError) {
      const nextPath = sanitizeNextPath(request.nextUrl.searchParams.get("next"), "/")
      return redirectWithNotice(request, nextPath, "auth-failed")
    }

    console.error(error)
    return redirectWithNotice(request, "/", "auth-failed")
  }
}
