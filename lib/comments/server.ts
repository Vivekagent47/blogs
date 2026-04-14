import "server-only"

import { revalidatePath } from "next/cache"
import { type User } from "@supabase/supabase-js"

import { getEntryBySlug, isCommentsEnabled } from "@/lib/content"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { isMissingSupabaseSession } from "@/lib/supabase/auth-errors"
import type { Database } from "@/lib/supabase/database.types"
import { isCommentsBackendConfigured } from "@/lib/supabase/env"
import { createSupabaseServerClient } from "@/lib/supabase/server"

import { CommentsApiError } from "./security"
import {
  COMMENT_AUTO_HIDE_REPORT_THRESHOLD,
  COMMENT_DAILY_LIMIT,
  COMMENT_EDIT_WINDOW_MINUTES,
  COMMENT_IP_WINDOW_LIMIT,
  COMMENT_SHORT_WINDOW_LIMIT,
  COMMENT_SHORT_WINDOW_MINUTES,
  type CommentNode,
  type CommentsSectionData,
  type CommentStatus,
  type CommentViewer,
} from "./types"
import {
  assertCommentBodyAllowed,
  deriveDisplayName,
  normalizeCommentBody,
  normalizeDisplayName,
  normalizeOptionalDetails,
  normalizeReportReason,
} from "./validation"

type AdminClient = NonNullable<ReturnType<typeof createSupabaseAdminClient>>
type CommentRow = Database["public"]["Tables"]["comments"]["Row"]
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"]
type ModerationRow = Database["public"]["Tables"]["comment_user_moderation"]["Row"]

type AuthenticatedCommenter = {
  admin: AdminClient
  displayName: string
  moderation: ModerationRow
  user: User
}

const EDIT_WINDOW_MS = COMMENT_EDIT_WINDOW_MINUTES * 60 * 1000

function getRequiredAdminClient() {
  const admin = createSupabaseAdminClient()
  if (!admin) {
    throw new CommentsApiError(
      503,
      "Comments are offline until the Supabase backend is configured.",
      "comments_offline",
    )
  }

  return admin
}

function getFallbackViewer(): CommentViewer {
  return {
    canComment: false,
    defaultDisplayName: "Reader",
    email: null,
    id: null,
    isAuthenticated: false,
    isBanned: false,
  }
}

function getPostOrThrow(postSlug: string) {
  const entry = getEntryBySlug("blog", postSlug, { includeDrafts: false })

  if (!entry) {
    throw new CommentsApiError(404, "That post does not exist.", "post_not_found")
  }

  if (!isCommentsEnabled(entry)) {
    throw new CommentsApiError(
      403,
      "Comments are disabled for this post.",
      "comments_disabled",
    )
  }

  return entry
}

async function getOrCreateModerationRow(admin: AdminClient, userId: string) {
  const existing = await admin
    .from("comment_user_moderation")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle()

  if (existing.error) {
    throw existing.error
  }

  if (existing.data) {
    return existing.data
  }

  const created = await admin
    .from("comment_user_moderation")
    .insert({ user_id: userId })
    .select("*")
    .single()

  if (created.error) {
    throw created.error
  }

  return created.data
}

async function upsertProfile(admin: AdminClient, user: User, displayName: string) {
  const { error } = await admin.from("profiles").upsert(
    {
      display_name: displayName,
      id: user.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  )

  if (error) {
    throw error
  }
}

async function requireAuthenticatedCommenter() {
  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    throw new CommentsApiError(
      503,
      "Comments are offline until the Supabase backend is configured.",
      "comments_offline",
    )
  }

  const { data, error } = await supabase.auth.getUser()
  if (error && !isMissingSupabaseSession(error)) {
    throw error
  }

  const user = data.user
  if (!user) {
    throw new CommentsApiError(401, "You need to sign in before commenting.", "auth_required")
  }

  const admin = getRequiredAdminClient()
  const moderation = await getOrCreateModerationRow(admin, user.id)

  if (moderation.is_banned) {
    throw new CommentsApiError(
      403,
      "This account can no longer post comments.",
      "account_banned",
    )
  }

  const profileResult = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  if (profileResult.error) {
    throw profileResult.error
  }

  return {
    admin,
    displayName: profileResult.data?.display_name ?? deriveDisplayName(user.email),
    moderation,
    user,
  } satisfies AuthenticatedCommenter
}

function startOfShortWindow(now = new Date()) {
  const date = new Date(now)
  date.setUTCMinutes(Math.floor(date.getUTCMinutes() / COMMENT_SHORT_WINDOW_MINUTES) * COMMENT_SHORT_WINDOW_MINUTES)
  date.setUTCSeconds(0, 0)
  return date.toISOString()
}

function startOfDay(now = new Date()) {
  const date = new Date(now)
  date.setUTCHours(0, 0, 0, 0)
  return date.toISOString()
}

async function incrementWindow(
  admin: AdminClient,
  scope: string,
  scopeKey: string,
  windowStartsAt: string,
) {
  const existing = await admin
    .from("comment_rate_limits")
    .select("*")
    .eq("scope", scope)
    .eq("scope_key", scopeKey)
    .eq("window_starts_at", windowStartsAt)
    .maybeSingle()

  if (existing.error) {
    throw existing.error
  }

  if (!existing.data) {
    const inserted = await admin
      .from("comment_rate_limits")
      .insert({
        attempts: 1,
        scope,
        scope_key: scopeKey,
        window_starts_at: windowStartsAt,
      })
      .select("*")
      .single()

    if (inserted.error) {
      throw inserted.error
    }

    return inserted.data.attempts
  }

  const updated = await admin
    .from("comment_rate_limits")
    .update({
      attempts: existing.data.attempts + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.data.id)
    .select("*")
    .single()

  if (updated.error) {
    throw updated.error
  }

  return updated.data.attempts
}

async function enforceRateLimits(admin: AdminClient, userId: string, ipHash: string | null) {
  const shortWindow = startOfShortWindow()
  const shortUserAttempts = await incrementWindow(admin, "user:1m", userId, shortWindow)
  if (shortUserAttempts > COMMENT_SHORT_WINDOW_LIMIT) {
    throw new CommentsApiError(
      429,
      "You can post at most 5 comments per minute. Please wait and try again.",
      "rate_limited",
    )
  }

  const dailyAttempts = await incrementWindow(admin, "user:1d", userId, startOfDay())
  if (dailyAttempts > COMMENT_DAILY_LIMIT) {
    throw new CommentsApiError(
      429,
      "You've reached the 30 comment limit for today.",
      "daily_limit",
    )
  }

  if (!ipHash) {
    return
  }

  const ipAttempts = await incrementWindow(admin, "ip:1m", ipHash, shortWindow)
  if (ipAttempts > COMMENT_IP_WINDOW_LIMIT) {
    throw new CommentsApiError(
      429,
      "That network is posting too quickly. Try again in a minute.",
      "ip_rate_limited",
    )
  }
}

async function ensureNotDuplicate(
  admin: AdminClient,
  userId: string,
  normalizedBody: string,
  ipHash: string | null,
) {
  const recentThreshold = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const duplicateByUser = await admin
    .from("comments")
    .select("id")
    .eq("author_id", userId)
    .eq("normalized_body", normalizedBody)
    .gte("created_at", recentThreshold)
    .neq("status", "deleted")
    .limit(1)

  if (duplicateByUser.error) {
    throw duplicateByUser.error
  }

  if (duplicateByUser.data.length > 0) {
    throw new CommentsApiError(
      409,
      "That looks like a duplicate comment you already posted.",
      "duplicate_comment",
    )
  }

  if (!ipHash) {
    return
  }

  const duplicateByIp = await admin
    .from("comments")
    .select("id")
    .eq("author_ip_hash", ipHash)
    .eq("normalized_body", normalizedBody)
    .gte("created_at", recentThreshold)
    .neq("status", "deleted")
    .limit(1)

  if (duplicateByIp.error) {
    throw duplicateByIp.error
  }

  if (duplicateByIp.data.length > 0) {
    throw new CommentsApiError(
      409,
      "That same comment was just posted from this network.",
      "duplicate_network_comment",
    )
  }
}

async function getCommentById(admin: AdminClient, commentId: string) {
  const result = await admin.from("comments").select("*").eq("id", commentId).maybeSingle()
  if (result.error) {
    throw result.error
  }

  if (!result.data) {
    throw new CommentsApiError(404, "Comment not found.", "comment_not_found")
  }

  return result.data
}

async function validateParentComment(
  admin: AdminClient,
  parentId: string | null | undefined,
  postSlug: string,
) {
  if (!parentId) {
    return null
  }

  const parent = await getCommentById(admin, parentId)

  if (parent.post_slug !== postSlug) {
    throw new CommentsApiError(400, "Replies must stay on the same post.", "reply_post_mismatch")
  }

  if (parent.parent_id) {
    throw new CommentsApiError(400, "Replies only support one level.", "reply_depth_exceeded")
  }

  if (parent.status !== "visible") {
    throw new CommentsApiError(400, "You can only reply to visible comments.", "reply_not_allowed")
  }

  return parent
}

function mapCommentNode(
  row: CommentRow,
  author: ProfileRow | undefined,
  viewer: CommentViewer,
): CommentNode {
  const now = Date.now()
  const canEdit =
    viewer.id === row.author_id &&
    row.status === "visible" &&
    now < new Date(row.edit_window_expires_at).getTime()

  const canDelete = viewer.id === row.author_id && row.status !== "deleted"
  const canReply = viewer.canComment && row.parent_id === null && row.status === "visible"
  const canReport = Boolean(viewer.id) && viewer.id !== row.author_id && row.status === "visible"
  const isRemoved = row.status !== "visible"

  return {
    author: {
      displayName:
        author?.display_name ?? (viewer.id === row.author_id ? viewer.defaultDisplayName : "Reader"),
      id: row.author_id,
    },
    body: row.body,
    canDelete,
    canEdit,
    canReport,
    canReply,
    createdAt: row.created_at,
    deletedAt: row.deleted_at,
    editedAt: row.edited_at,
    id: row.id,
    isRemoved,
    parentId: row.parent_id,
    replies: [],
    status: row.status as CommentStatus,
  }
}

async function fetchVisibleComments(admin: AdminClient, postSlug: string) {
  const commentsResult = await admin
    .from("comments")
    .select("*")
    .eq("post_slug", postSlug)
    .order("created_at", { ascending: true })

  if (commentsResult.error) {
    throw commentsResult.error
  }

  const comments = commentsResult.data
  const authorIds = Array.from(new Set(comments.map((comment) => comment.author_id)))

  const profilesResult =
    authorIds.length === 0
      ? { data: [] as ProfileRow[], error: null }
      : await admin.from("profiles").select("*").in("id", authorIds)

  if (profilesResult.error) {
    throw profilesResult.error
  }

  const profilesById = new Map(profilesResult.data.map((profile) => [profile.id, profile]))

  return { comments, profilesById }
}

export async function getCommentsSectionData(postSlug: string): Promise<CommentsSectionData> {
  if (!isCommentsBackendConfigured()) {
    return {
      comments: [],
      isConfigured: false,
      totalVisibleComments: 0,
      viewer: getFallbackViewer(),
    }
  }

  getPostOrThrow(postSlug)

  const admin = getRequiredAdminClient()
  const supabase = await createSupabaseServerClient()

  const [commentData, userResult] = await Promise.all([
    fetchVisibleComments(admin, postSlug),
    supabase?.auth.getUser() ?? Promise.resolve({ data: { user: null }, error: null }),
  ])

  if (userResult.error && !isMissingSupabaseSession(userResult.error)) {
    throw userResult.error
  }

  const user = userResult.data.user
  let viewer = getFallbackViewer()

  if (user) {
    const [profileResult, moderationResult] = await Promise.all([
      admin.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      admin.from("comment_user_moderation").select("*").eq("user_id", user.id).maybeSingle(),
    ])

    if (profileResult.error) {
      throw profileResult.error
    }

    if (moderationResult.error) {
      throw moderationResult.error
    }

    viewer = {
      canComment: !moderationResult.data?.is_banned,
      defaultDisplayName:
        profileResult.data?.display_name ?? deriveDisplayName(user.email),
      email: user.email ?? null,
      id: user.id,
      isAuthenticated: true,
      isBanned: moderationResult.data?.is_banned ?? false,
    }
  }

  const nodesById = new Map<string, CommentNode>()
  const roots: CommentNode[] = []
  let totalVisibleComments = 0

  for (const row of commentData.comments) {
    if (row.status === "visible") {
      totalVisibleComments += 1
    }

    nodesById.set(row.id, mapCommentNode(row, commentData.profilesById.get(row.author_id), viewer))
  }

  for (const row of commentData.comments) {
    const node = nodesById.get(row.id)
    if (!node) {
      continue
    }

    if (row.parent_id) {
      const parent = nodesById.get(row.parent_id)
      parent?.replies.push(node)
      continue
    }

    roots.push(node)
  }

  return {
    comments: roots,
    isConfigured: true,
    totalVisibleComments,
    viewer,
  }
}

type CreateCommentInput = {
  body: unknown
  displayName: unknown
  parentId?: unknown
  postSlug: unknown
}

export async function createComment(
  input: CreateCommentInput,
  ipHash: string | null,
  userAgent: string | null,
) {
  const postSlug = typeof input.postSlug === "string" ? input.postSlug.trim() : ""
  if (!postSlug) {
    throw new CommentsApiError(400, "Post slug is required.", "missing_post_slug")
  }

  const entry = getPostOrThrow(postSlug)
  const commenter = await requireAuthenticatedCommenter()
  const displayName = normalizeDisplayName(input.displayName, commenter.user.email)
  const { body, normalizedBody } = normalizeCommentBody(input.body)
  const parentId = typeof input.parentId === "string" ? input.parentId.trim() : null

  assertCommentBodyAllowed(body, commenter.moderation.is_trusted)

  await validateParentComment(commenter.admin, parentId, entry.slug)
  await enforceRateLimits(commenter.admin, commenter.user.id, ipHash)
  await ensureNotDuplicate(commenter.admin, commenter.user.id, normalizedBody, ipHash)
  await upsertProfile(commenter.admin, commenter.user, displayName)

  const { error } = await commenter.admin.from("comments").insert({
    author_id: commenter.user.id,
    author_ip_hash: ipHash,
    body,
    edit_window_expires_at: new Date(Date.now() + EDIT_WINDOW_MS).toISOString(),
    normalized_body: normalizedBody,
    parent_id: parentId,
    post_slug: entry.slug,
    status: "visible",
    user_agent: userAgent,
  })

  if (error) {
    throw error
  }

  revalidatePath(`/blog/${entry.slug}`)
}

export async function editComment(
  commentId: string,
  bodyInput: unknown,
) {
  const commenter = await requireAuthenticatedCommenter()
  const comment = await getCommentById(commenter.admin, commentId)

  if (comment.author_id !== commenter.user.id) {
    throw new CommentsApiError(403, "You can only edit your own comments.", "edit_forbidden")
  }

  if (comment.status !== "visible") {
    throw new CommentsApiError(400, "Only visible comments can be edited.", "edit_invalid_status")
  }

  if (Date.now() > new Date(comment.edit_window_expires_at).getTime()) {
    throw new CommentsApiError(
      400,
      "The edit window has expired for this comment.",
      "edit_window_expired",
    )
  }

  const { body, normalizedBody } = normalizeCommentBody(bodyInput)
  assertCommentBodyAllowed(body, commenter.moderation.is_trusted)

  const { error } = await commenter.admin
    .from("comments")
    .update({
      body,
      edited_at: new Date().toISOString(),
      normalized_body: normalizedBody,
      updated_at: new Date().toISOString(),
    })
    .eq("id", comment.id)

  if (error) {
    throw error
  }

  revalidatePath(`/blog/${comment.post_slug}`)
}

export async function deleteComment(commentId: string) {
  const commenter = await requireAuthenticatedCommenter()
  const comment = await getCommentById(commenter.admin, commentId)

  if (comment.author_id !== commenter.user.id) {
    throw new CommentsApiError(403, "You can only delete your own comments.", "delete_forbidden")
  }

  if (comment.status === "deleted") {
    return
  }

  const { error } = await commenter.admin
    .from("comments")
    .update({
      deleted_at: new Date().toISOString(),
      status: "deleted",
      updated_at: new Date().toISOString(),
    })
    .eq("id", comment.id)

  if (error) {
    throw error
  }

  revalidatePath(`/blog/${comment.post_slug}`)
}

export async function reportComment(
  commentId: string,
  reasonInput: unknown,
  detailsInput: unknown,
) {
  const commenter = await requireAuthenticatedCommenter()
  const comment = await getCommentById(commenter.admin, commentId)

  if (comment.author_id === commenter.user.id) {
    throw new CommentsApiError(400, "You can't report your own comment.", "report_self")
  }

  const reason = normalizeReportReason(reasonInput)
  const details = normalizeOptionalDetails(detailsInput)

  const { error } = await commenter.admin.from("comment_reports").upsert(
    {
      comment_id: comment.id,
      details,
      reason,
      reporter_id: commenter.user.id,
      status: "open",
    },
    { onConflict: "comment_id,reporter_id" },
  )

  if (error) {
    throw error
  }

  const reportCount = await commenter.admin
    .from("comment_reports")
    .select("id", { count: "exact", head: true })
    .eq("comment_id", comment.id)
    .eq("status", "open")

  if (reportCount.error) {
    throw reportCount.error
  }

  if ((reportCount.count ?? 0) >= COMMENT_AUTO_HIDE_REPORT_THRESHOLD && comment.status === "visible") {
    const hideResult = await commenter.admin
      .from("comments")
      .update({
        hidden_at: new Date().toISOString(),
        moderation_reason: "auto_hidden_from_reports",
        status: "hidden",
        updated_at: new Date().toISOString(),
      })
      .eq("id", comment.id)

    if (hideResult.error) {
      throw hideResult.error
    }
  }

  revalidatePath(`/blog/${comment.post_slug}`)
}
