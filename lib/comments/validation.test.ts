import assert from "node:assert/strict"
import { afterEach, describe, test } from "node:test"

import {
  assertCommentBodyAllowed,
  normalizeCommentBody,
  normalizeDisplayName,
} from "./validation"

const originalTerms = process.env.COMMENT_BANNED_TERMS

afterEach(() => {
  process.env.COMMENT_BANNED_TERMS = originalTerms
})

describe("comment validation", () => {
  test("normalizes body text and trims trailing whitespace", () => {
    assert.deepStrictEqual(normalizeCommentBody("  hello world  \n"), {
      body: "hello world",
      normalizedBody: "hello world",
    })
  })

  test("blocks links for untrusted commenters", () => {
    assert.throws(() => assertCommentBodyAllowed("Visit https://example.com", false), /Links are disabled/)
  })

  test("allows links for trusted commenters", () => {
    assert.doesNotThrow(() => assertCommentBodyAllowed("Visit https://example.com", true))
  })

  test("blocks banned terms when configured", () => {
    process.env.COMMENT_BANNED_TERMS = "scamword"

    assert.throws(
      () => assertCommentBodyAllowed("This contains scamword text", true),
      /blocked language/,
    )
  })

  test("matches banned terms as whole words or phrases, not substrings", () => {
    process.env.COMMENT_BANNED_TERMS = "rape,kill yourself"

    assert.doesNotThrow(() => assertCommentBodyAllowed("A grape is a fruit.", true))
    assert.throws(() => assertCommentBodyAllowed("I will rape you", true), /blocked language/)
    assert.throws(
      () => assertCommentBodyAllowed("You should kill yourself", true),
      /blocked language/,
    )
  })

  test("falls back to email-derived display names", () => {
    assert.equal(normalizeDisplayName("", "vivek.chauhan@example.com"), "vivek chauhan")
  })
})
