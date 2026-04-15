import assert from "node:assert/strict"
import { describe, test } from "node:test"

import { getCommentsRedirectBaseUrl } from "./env"

const productionUrl = "https://blog.vivekchauhan.xyz"

describe("getCommentsRedirectBaseUrl", () => {
  test("uses the hardcoded production URL for non-local requests", () => {
    assert.equal(getCommentsRedirectBaseUrl(productionUrl), productionUrl)
    assert.equal(
      getCommentsRedirectBaseUrl("https://comments-preview-123.vercel.app"),
      productionUrl
    )
  })

  test("keeps localhost only for local development requests", () => {
    assert.equal(getCommentsRedirectBaseUrl("http://localhost:3000"), "http://localhost:3000")
  })

  test("uses the hardcoded production URL when there is no request origin", () => {
    assert.equal(getCommentsRedirectBaseUrl(), productionUrl)
  })
})
