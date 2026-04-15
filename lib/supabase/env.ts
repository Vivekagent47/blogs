import "dotenv/config"

const productionSiteUrl = "https://blog.vivekchauhan.xyz"

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

function isLocalOrigin(rawValue: string) {
  const { hostname } = new URL(normalizeBaseUrl(rawValue))
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0"
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
  if (requestOrigin) {
    try {
      const normalizedRequestOrigin = normalizeBaseUrl(requestOrigin)
      if (isLocalOrigin(normalizedRequestOrigin)) {
        return normalizedRequestOrigin
      }
    } catch {
      // Ignore invalid request origins and fall through to the production URL.
    }
  }

  return productionSiteUrl
}

export function isCommentsBackendConfigured() {
  return getSupabaseAdminEnv() !== null
}
