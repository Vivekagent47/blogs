import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import type { Database } from "./database.types"
import { isMissingSupabaseSession } from "./auth-errors"
import { getSupabaseProjectEnv } from "./env"

export async function updateSession(request: NextRequest) {
  const env = getSupabaseProjectEnv()
  if (!env) {
    return NextResponse.next({ request })
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(env.url, env.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll().map(({ name, value }) => ({ name, value }))
      },
      setAll(cookiesToSet, headers) {
        response = NextResponse.next({ request })

        for (const [name, value] of Object.entries(headers)) {
          response.headers.set(name, value)
        }

        for (const { name, value, options } of cookiesToSet) {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        }
      },
    },
  })

  try {
    await supabase.auth.getClaims()
  } catch (error) {
    if (!isMissingSupabaseSession(error)) {
      throw error
    }
  }

  return response
}
