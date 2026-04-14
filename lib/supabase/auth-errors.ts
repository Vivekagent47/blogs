import { isAuthSessionMissingError } from "@supabase/supabase-js"

export function isMissingSupabaseSession(error: unknown) {
  return isAuthSessionMissingError(error)
}
