function readEnv(name: string) {
  const value = process.env[name]?.trim()
  return value && value.length > 0 ? value : null
}

export function getSupabaseProjectEnv() {
  const url = readEnv("SUPABASE_URL")
  const publishableKey = readEnv("SUPABASE_PUBLISHABLE_KEY")

  if (!url || !publishableKey) {
    return null
  }

  return { url, publishableKey }
}

export function getSupabaseAdminEnv() {
  const projectEnv = getSupabaseProjectEnv()
  const serviceRoleKey =
    readEnv("SUPABASE_SERVICE_ROLE_KEY") ?? readEnv("SUPABASE_SECRET_KEY")

  if (!projectEnv || !serviceRoleKey) {
    return null
  }

  return {
    ...projectEnv,
    serviceRoleKey,
  }
}

export function getCommentsRedirectBaseUrl() {
  return (
    readEnv("COMMENTS_AUTH_REDIRECT_URL") ??
    readEnv("NEXT_PUBLIC_SITE_URL") ??
    readEnv("SITE_URL") ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000")
  )
}

export function isCommentsBackendConfigured() {
  return getSupabaseAdminEnv() !== null
}
