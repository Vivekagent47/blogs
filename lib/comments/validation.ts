import {
  COMMENT_BODY_MAX_LENGTH,
  COMMENT_BODY_MIN_LENGTH,
  COMMENT_DISPLAY_NAME_MAX_LENGTH,
  COMMENT_REPORT_REASONS,
  type CommentReportReason,
} from "./types"

const urlPattern =
  /\b(?:https?:\/\/|www\.|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s]*)?)(?=\s|$)/i
const repeatedPunctuationPattern = /[!?.,]{8,}/
const repeatedCharacterPattern = /(.)\1{11,}/i
const disallowedDisplayNamePattern = /[<>]/
const blockedTermSeparatorPattern = /[^\p{L}\p{N}]+/u

function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function blockedTermToPattern(term: string) {
  const escaped = escapeRegex(term.trim()).replaceAll("\\ ", "\\s+")
  return new RegExp(`(^|${blockedTermSeparatorPattern.source})${escaped}($|${blockedTermSeparatorPattern.source})`, "iu")
}

export function deriveDisplayName(email: string | null | undefined) {
  const localPart = email?.split("@")[0]?.trim()
  if (!localPart) {
    return "Reader"
  }

  const readable = localPart
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  if (!readable) {
    return "Reader"
  }

  return readable.slice(0, COMMENT_DISPLAY_NAME_MAX_LENGTH)
}

export function normalizeDisplayName(input: unknown, fallbackEmail: string | null | undefined) {
  const raw = typeof input === "string" ? input : ""
  const fallback = deriveDisplayName(fallbackEmail)
  const value = (raw.trim() || fallback).slice(0, COMMENT_DISPLAY_NAME_MAX_LENGTH)

  if (value.length < 2) {
    throw new Error("Display name must be at least 2 characters.")
  }

  if (disallowedDisplayNamePattern.test(value)) {
    throw new Error("Display name contains unsupported characters.")
  }

  return value
}

export function normalizeCommentBody(input: unknown) {
  if (typeof input !== "string") {
    throw new Error("Comment text is required.")
  }

  const body = input
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ \u00A0]+$/gm, "")
    .trim()

  if (body.length < COMMENT_BODY_MIN_LENGTH) {
    throw new Error("Comment is too short.")
  }

  if (body.length > COMMENT_BODY_MAX_LENGTH) {
    throw new Error(`Comment must stay under ${COMMENT_BODY_MAX_LENGTH} characters.`)
  }

  return {
    body,
    normalizedBody: normalizeForSpamCheck(body),
  }
}

export function normalizeReportReason(input: unknown): CommentReportReason {
  if (
    typeof input === "string" &&
    COMMENT_REPORT_REASONS.includes(input as CommentReportReason)
  ) {
    return input as CommentReportReason
  }

  throw new Error("Please choose a valid report reason.")
}

export function normalizeOptionalDetails(input: unknown) {
  if (typeof input !== "string") {
    return null
  }

  const value = input.trim()
  if (!value) {
    return null
  }

  return value.slice(0, 500)
}

export function assertCommentBodyAllowed(body: string, isTrusted: boolean) {
  if (!isTrusted && urlPattern.test(body)) {
    throw new Error("Links are disabled for new commenters until an admin marks the account trusted.")
  }

  if (repeatedPunctuationPattern.test(body) || repeatedCharacterPattern.test(body)) {
    throw new Error("That comment looks like spam. Please rewrite it more naturally.")
  }

  const bannedTerms = process.env.COMMENT_BANNED_TERMS
    ?.split(",")
    .map((term) => term.trim().toLowerCase())
    .filter(Boolean)

  if (bannedTerms?.length) {
    if (bannedTerms.some((term) => blockedTermToPattern(term).test(body))) {
      throw new Error("That comment includes blocked language.")
    }
  }
}

export function normalizeForSpamCheck(input: string) {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
}
