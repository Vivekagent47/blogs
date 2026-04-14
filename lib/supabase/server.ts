import "server-only"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import type { Database } from "./database.types"
import { getSupabaseProjectEnv } from "./env"

export async function createSupabaseServerClient() {
  const env = getSupabaseProjectEnv()
  if (!env) {
    return null
  }

  const cookieStore = await cookies()

  return createServerClient<Database>(env.url, env.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll().map(({ name, value }) => ({ name, value }))
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Cookie writes may be unavailable in some server rendering contexts.
        }
      },
    },
  })
}
