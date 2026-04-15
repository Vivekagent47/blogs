import assert from "node:assert/strict"
import { afterEach, describe, test } from "node:test"

import { getCommentsRedirectBaseUrl } from "./env"

const productionUrl = "https://blog.vivekchauhan.xyz"

const originalEnv = {
  COMMENTS_AUTH_REDIRECT_URL: process.env.COMMENTS_AUTH_REDIRECT_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  SITE_URL: process.env.SITE_URL,
  VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
  VERCEL_BRANCH_URL: process.env.VERCEL_BRANCH_URL,
  VERCEL_URL: process.env.VERCEL_URL,
}

function restoreEnv() {
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) {
      delete process.env[key]
      continue
    }

    process.env[key] = value
  }
}

function clearRedirectEnv() {
  delete process.env.COMMENTS_AUTH_REDIRECT_URL
  delete process.env.NEXT_PUBLIC_SITE_URL
  delete process.env.SITE_URL
  delete process.env.VERCEL_PROJECT_PRODUCTION_URL
  delete process.env.VERCEL_BRANCH_URL
  delete process.env.VERCEL_URL
}

afterEach(() => {
  restoreEnv()
})

describe("getCommentsRedirectBaseUrl", () => {
  test("prefers the configured production redirect over a local request origin", () => {
    clearRedirectEnv()
    process.env.COMMENTS_AUTH_REDIRECT_URL = productionUrl

    assert.equal(
      getCommentsRedirectBaseUrl("http://localhost:3000"),
      productionUrl
    )
  })

  test("uses the live request origin before falling back to localhost", () => {
    clearRedirectEnv()

    assert.equal(getCommentsRedirectBaseUrl(productionUrl), productionUrl)
  })

  test("normalizes bare vercel-style hostnames", () => {
    clearRedirectEnv()
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "blog.vivekchauhan.xyz"

    assert.equal(getCommentsRedirectBaseUrl(), productionUrl)
  })

  test("falls back to localhost only when no runtime origin is available", () => {
    clearRedirectEnv()

    assert.equal(getCommentsRedirectBaseUrl(), "http://localhost:3000")
  })
})
