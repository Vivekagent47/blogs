import "server-only"

import { createClient } from "@supabase/supabase-js"

import type { Database } from "./database.types"
import { getSupabaseAdminEnv } from "./env"

export function createSupabaseAdminClient() {
  const env = getSupabaseAdminEnv()
  if (!env) {
    return null
  }

  return createClient<Database>(env.url, env.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
