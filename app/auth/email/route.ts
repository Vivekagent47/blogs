import { NextResponse, type NextRequest } from "next/server"

import {
  CommentsApiError,
  assertSameOrigin,
  sanitizeNextPath,
} from "@/lib/comments/security"
import { getCommentsRedirectBaseUrl } from "@/lib/supabase/env"
import { createSupabaseServerClient } from "@/lib/supabase/server"

function redirectWithNotice(
  request: NextRequest,
  nextPath: string,
  notice: string
) {
  const redirectUrl = request.nextUrl.clone()
  redirectUrl.pathname = nextPath
  redirectUrl.searchParams.set("comments_notice", notice)
  return NextResponse.redirect(redirectUrl, { status: 303 })
}

export async function POST(request: NextRequest) {
  let nextPath = "/"

  try {
    assertSameOrigin(request)

    const formData = await request.formData()
    const email =
      typeof formData.get("email") === "string"
        ? String(formData.get("email")).trim()
        : ""
    nextPath = sanitizeNextPath(
      typeof formData.get("next") === "string"
        ? String(formData.get("next"))
        : null,
      "/"
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
      console.error("Supabase signInWithOtp failed", {
        code: error.code,
        email,
        message: error.message,
        nextPath,
        status: error.status,
      })

      if (error.code === "over_email_send_rate_limit" || error.status === 429) {
        return redirectWithNotice(request, nextPath, "magic-link-rate-limited")
      }

      throw new CommentsApiError(400, error.message, "magic_link_failed")
    }

    return redirectWithNotice(request, nextPath, "magic-link-sent")
  } catch (error) {
    if (error instanceof CommentsApiError) {
      console.error("Comment auth email route failed", {
        code: error.code,
        message: error.message,
        nextPath,
        status: error.status,
      })
      return redirectWithNotice(request, nextPath, "auth-failed")
    }

    console.error(error)
    return redirectWithNotice(request, nextPath, "auth-failed")
  }
}
