import type { CommentNoticeKey } from "./types"

const noticeMessages: Record<CommentNoticeKey, string> = {
  "auth-failed": "We couldn't confirm that sign-in link. Request a fresh one and try again.",
  "comments-offline": "Comments are offline until Supabase is configured for this site.",
  "magic-link-rate-limited":
    "Too many sign-in emails were sent. Wait a bit before trying again, or set up custom SMTP in Supabase for higher limits.",
  "magic-link-sent": "Check your email for a sign-in link, then come back to join the discussion.",
  "signed-in": "You're signed in and can comment now.",
  "signed-out": "You've been signed out of the comments session.",
}

export function getCommentNoticeMessage(input: string | string[] | undefined) {
  const raw = Array.isArray(input) ? input[0] : input
  if (!raw) {
    return null
  }

  return raw in noticeMessages
    ? noticeMessages[raw as CommentNoticeKey]
    : null
}
