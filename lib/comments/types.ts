export const COMMENT_BODY_MAX_LENGTH = 2_000
export const COMMENT_BODY_MIN_LENGTH = 2
export const COMMENT_DISPLAY_NAME_MAX_LENGTH = 40
export const COMMENT_EDIT_WINDOW_MINUTES = 15
export const COMMENT_SHORT_WINDOW_LIMIT = 5
export const COMMENT_SHORT_WINDOW_MINUTES = 1
export const COMMENT_DAILY_LIMIT = 30
export const COMMENT_IP_WINDOW_LIMIT = 10
export const COMMENT_AUTO_HIDE_REPORT_THRESHOLD = 3

export const COMMENT_REPORT_REASONS = [
  "spam",
  "abuse",
  "off-topic",
  "unsafe",
  "other",
] as const

export type CommentStatus = "visible" | "hidden" | "deleted"
export type CommentReportReason = (typeof COMMENT_REPORT_REASONS)[number]
export type CommentNoticeKey =
  | "magic-link-sent"
  | "signed-in"
  | "signed-out"
  | "auth-failed"
  | "comments-offline"

export type CommentAuthor = {
  displayName: string
  id: string
}

export type CommentViewer = {
  canComment: boolean
  defaultDisplayName: string
  email: string | null
  id: string | null
  isAuthenticated: boolean
  isBanned: boolean
}

export type CommentNode = {
  author: CommentAuthor
  body: string
  canDelete: boolean
  canEdit: boolean
  canReport: boolean
  canReply: boolean
  createdAt: string
  deletedAt: string | null
  editedAt: string | null
  id: string
  isRemoved: boolean
  parentId: string | null
  replies: CommentNode[]
  status: CommentStatus
}

export type CommentsSectionData = {
  comments: CommentNode[]
  isConfigured: boolean
  totalVisibleComments: number
  viewer: CommentViewer
}
