import "dotenv/config"

function readEnv(name: string) {
  const value = process.env[name]?.trim()
  return value && value.length > 0 ? value : null
}

function normalizeBaseUrl(rawValue: string) {
  const value =
    rawValue.startsWith("http://") || rawValue.startsWith("https://")
      ? rawValue
      : `https://${rawValue}`

  return new URL(value).origin
}

function resolveBaseUrl(...candidates: Array<string | null | undefined>) {
  for (const candidate of candidates) {
    if (!candidate) {
      continue
    }

    try {
      return normalizeBaseUrl(candidate)
    } catch {
      continue
    }
  }

  return null
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

export function getCommentsRedirectBaseUrl(requestOrigin?: string | null) {
  return (
    resolveBaseUrl(
      readEnv("COMMENTS_AUTH_REDIRECT_URL"),
      requestOrigin,
      readEnv("NEXT_PUBLIC_SITE_URL"),
      readEnv("SITE_URL"),
      readEnv("VERCEL_PROJECT_PRODUCTION_URL"),
      readEnv("VERCEL_BRANCH_URL"),
      readEnv("VERCEL_URL")
    ) ?? "http://localhost:3000"
  )
}

export function isCommentsBackendConfigured() {
  return getSupabaseAdminEnv() !== null
}
