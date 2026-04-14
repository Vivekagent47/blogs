import { NextResponse, type NextRequest } from "next/server"

import { assertSameOrigin, sanitizeNextPath } from "@/lib/comments/security"
import { isMissingSupabaseSession } from "@/lib/supabase/auth-errors"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  assertSameOrigin(request)

  const formData = await request.formData()
  const nextPath = sanitizeNextPath(
    typeof formData.get("next") === "string" ? String(formData.get("next")) : null,
    "/",
  )

  const redirectUrl = request.nextUrl.clone()
  redirectUrl.pathname = nextPath
  redirectUrl.searchParams.set("comments_notice", "signed-out")

  const supabase = await createSupabaseServerClient()
  if (supabase) {
    const { error } = await supabase.auth.signOut()
    if (error && !isMissingSupabaseSession(error)) {
      throw error
    }
  }

  return NextResponse.redirect(redirectUrl)
}
