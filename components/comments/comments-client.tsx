"use client"

import {
  useEffect,
  useState,
  useTransition,
  type ComponentProps,
  type FormEvent,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import {
  CornerDownRight,
  Flag,
  MessageSquareQuote,
  PencilLine,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react"

import type { CommentNode, CommentReportReason, CommentViewer } from "@/lib/comments/types"
import { formatCommentTimestamp } from "@/lib/comments/format"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type FlashState = {
  kind: "error" | "success"
  text: string
}

type CommentsClientProps = {
  comments: CommentNode[]
  currentPath: string
  isConfigured: boolean
  noticeMessage: string | null
  postSlug: string
  totalVisibleComments: number
  viewer: CommentViewer
}

type CommentComposerProps = {
  defaultBody?: string
  defaultDisplayName: string
  isPending: boolean
  onCancel?: () => void
  onSubmit: (payload: { body: string; displayName: string }) => Promise<void>
  showDisplayName: boolean
  submitLabel: string
  tone?: "primary" | "subtle"
}

type CommentItemProps = {
  activeEditId: string | null
  activeReportId: string | null
  activeReplyId: string | null
  mutationKey: string | null
  node: CommentNode
  onDelete: (commentId: string) => Promise<void>
  onEdit: (commentId: string, body: string) => Promise<void>
  onReport: (commentId: string, reason: CommentReportReason, details: string) => Promise<void>
  onReply: (parentId: string, body: string, displayName: string) => Promise<void>
  setActiveEditId: (value: string | null) => void
  setActiveReportId: (value: string | null) => void
  setActiveReplyId: (value: string | null) => void
  viewer: CommentViewer
  depth?: 0 | 1
}

const reportReasons: Array<{ description: string; value: CommentReportReason }> = [
  { description: "Looks like promotional or bot spam.", value: "spam" },
  { description: "Contains harassment, insults, or personal attacks.", value: "abuse" },
  { description: "Not relevant to the article discussion.", value: "off-topic" },
  { description: "Feels unsafe, malicious, or harmful.", value: "unsafe" },
  { description: "Something else needs moderator attention.", value: "other" },
]

async function requestJson(url: string, init: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  })

  if (response.ok) {
    return
  }

  const payload = (await response.json().catch(() => null)) as { error?: string } | null
  throw new Error(payload?.error ?? "Request failed.")
}

function getAuthorInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "R"
}

function ActionButton({
  children,
  className,
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn(
        "h-8 rounded-full border border-transparent bg-transparent px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:border-primary/20 hover:bg-primary/8 hover:text-foreground",
        className,
      )}
      size="xs"
      variant="ghost"
      {...props}
    >
      {children}
    </Button>
  )
}

function StatChip({
  icon,
  label,
}: {
  icon: ReactNode
  label: string
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-sm">
      <span className="text-primary">{icon}</span>
      <span>{label}</span>
    </div>
  )
}

function FlashBanner({ flash }: { flash: FlashState | null }) {
  if (!flash) {
    return null
  }

  return (
    <div
      className={cn(
        "rounded-[1.4rem] border px-4 py-3 text-sm shadow-sm backdrop-blur-sm",
        flash.kind === "error"
          ? "border-destructive/20 bg-destructive/8 text-destructive"
          : "border-primary/15 bg-primary/8 text-foreground",
      )}
    >
      {flash.text}
    </div>
  )
}

function CommentComposer({
  defaultBody = "",
  defaultDisplayName,
  isPending,
  onCancel,
  onSubmit,
  showDisplayName,
  submitLabel,
  tone = "primary",
}: CommentComposerProps) {
  const [body, setBody] = useState(defaultBody)
  const [displayName, setDisplayName] = useState(defaultDisplayName)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setBody(defaultBody)
  }, [defaultBody])

  useEffect(() => {
    setDisplayName(defaultDisplayName)
  }, [defaultDisplayName])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    try {
      await onSubmit({ body, displayName })

      if (submitLabel.toLowerCase().includes("post")) {
        setBody("")
      }

      if (onCancel) {
        onCancel()
      }
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Unable to submit your comment."
      setError(message)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {showDisplayName ? (
        <div className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Display name
          </label>
          <Input
            autoComplete="nickname"
            className="rounded-[1.25rem] border-border/70 bg-background/78 shadow-none"
            disabled={isPending}
            maxLength={40}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="How your name appears"
            value={displayName}
          />
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Comment
        </label>
        <Textarea
          className={cn(
            "min-h-36 rounded-[1.6rem] border-border/70 bg-background/78 text-[1rem] leading-8 shadow-none",
            tone === "primary" ? "placeholder:text-muted-foreground/75" : "placeholder:text-muted-foreground/70",
          )}
          disabled={isPending}
          maxLength={2000}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Add something useful, specific, or thought-provoking."
          value={body}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <p className="text-xs text-muted-foreground">Plain text only. Links stay blocked for new commenters.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button className="rounded-full px-5" disabled={isPending} type="submit">
            {isPending ? "Working..." : submitLabel}
          </Button>
          {onCancel ? (
            <Button
              className="rounded-full"
              disabled={isPending}
              type="button"
              variant="ghost"
              onClick={onCancel}
            >
              Cancel
            </Button>
          ) : null}
        </div>
      </div>
    </form>
  )
}

function ReportForm({
  commentId,
  isPending,
  onCancel,
  onSubmit,
}: {
  commentId: string
  isPending: boolean
  onCancel: () => void
  onSubmit: (commentId: string, reason: CommentReportReason, details: string) => Promise<void>
}) {
  const [reason, setReason] = useState<CommentReportReason>("spam")
  const [details, setDetails] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    try {
      await onSubmit(commentId, reason, details)
      onCancel()
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Unable to submit your report."
      setError(message)
    }
  }

  return (
    <form
      className="mt-4 space-y-4 rounded-[1.6rem] border border-destructive/12 bg-destructive/4 p-4"
      onSubmit={handleSubmit}
    >
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-destructive/80">
          Report this comment
        </p>
        <p className="text-sm leading-7 text-muted-foreground">
          Reports help auto-hide repeated abuse and surface issues in moderation review.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Reason
        </label>
        <select
          className="flex h-11 w-full rounded-[1.25rem] border border-border/70 bg-background/78 px-4 text-sm text-foreground outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
          disabled={isPending}
          onChange={(event) => setReason(event.target.value as CommentReportReason)}
          value={reason}
        >
          {reportReasons.map((item) => (
            <option key={item.value} value={item.value}>
              {item.value} - {item.description}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Details
        </label>
        <Textarea
          className="min-h-28 rounded-[1.35rem] border-border/70 bg-background/78 shadow-none"
          disabled={isPending}
          maxLength={500}
          onChange={(event) => setDetails(event.target.value)}
          placeholder="Anything that helps moderation understand the context."
          value={details}
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button className="rounded-full" disabled={isPending} type="submit" variant="destructive">
          {isPending ? "Sending..." : "Send report"}
        </Button>
        <Button className="rounded-full" disabled={isPending} type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

function CommentItem({
  activeEditId,
  activeReportId,
  activeReplyId,
  mutationKey,
  node,
  onDelete,
  onEdit,
  onReport,
  onReply,
  setActiveEditId,
  setActiveReportId,
  setActiveReplyId,
  viewer,
  depth = 0,
}: CommentItemProps) {
  const isEditing = activeEditId === node.id
  const isReplying = activeReplyId === node.id
  const isReporting = activeReportId === node.id
  const isMutating = mutationKey === node.id
  const isReply = depth === 1
  const showRoleChip = isReply && !node.isRemoved

  async function handleDelete() {
    const confirmed = window.confirm("Delete this comment? Replies will remain visible.")
    if (!confirmed) {
      return
    }

    await onDelete(node.id)
    setActiveEditId(null)
    setActiveReplyId(null)
  }

  return (
    <article
      className={cn(
        "group relative overflow-hidden border transition-transform duration-300",
        isReply
          ? "rounded-[1.25rem] border-border/45 bg-background/55 px-4 py-3 shadow-none"
          : "comments-paper rounded-[2rem] border-primary/10 bg-card/90 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 sm:p-6",
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0",
          isReply
            ? "h-10 bg-gradient-to-r from-primary/4 via-transparent to-transparent"
            : "h-20 bg-gradient-to-r from-primary/10 via-transparent to-chart-1/10",
        )}
      />

      <div className={cn("relative", isReply ? "space-y-3" : "space-y-5")}>
        <div className={cn("flex flex-wrap items-start justify-between", isReply ? "gap-3" : "gap-4")}>
          <div className={cn("flex min-w-0 items-start", isReply ? "gap-3" : "gap-4")}>
            <div
              className={cn(
                "flex shrink-0 items-center justify-center rounded-full border text-sm font-semibold shadow-sm",
                isReply
                  ? "size-8 border-border/55 bg-background/90 text-[12px] text-foreground"
                  : "size-11 border-primary/20 bg-primary/8 text-primary",
              )}
            >
              {getAuthorInitial(node.author.displayName)}
            </div>

            <div className="min-w-0 space-y-1">
              <div className={cn("flex flex-wrap items-center gap-2", isReply && "gap-1.5")}>
                <p className={cn("font-semibold text-foreground", isReply ? "text-[0.98rem]" : "text-base")}>
                  {node.author.displayName}
                </p>
                {showRoleChip ? (
                  <span className="rounded-full border border-border/60 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Reply
                  </span>
                ) : null}
                {node.isRemoved ? (
                  <span className="rounded-full border border-border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Removed
                  </span>
                ) : null}
              </div>
              <p
                className={cn(
                  "uppercase text-muted-foreground",
                  isReply ? "text-[10px] tracking-[0.14em]" : "text-xs tracking-[0.18em]",
                )}
              >
                {formatCommentTimestamp(node.createdAt)}
                {node.editedAt ? ` • edited ${formatCommentTimestamp(node.editedAt)}` : ""}
              </p>
            </div>
          </div>

          {node.isRemoved ? null : (
            <div className={cn("flex flex-wrap items-center", isReply ? "gap-0.5" : "gap-1")}>
              {node.canReply ? (
                <ActionButton
                  className={isReply ? "h-7 px-2.5 text-[10px]" : undefined}
                  onClick={() => {
                    setActiveEditId(null)
                    setActiveReportId(null)
                    setActiveReplyId(isReplying ? null : node.id)
                  }}
                >
                  <CornerDownRight className="size-3.5" />
                  Reply
                </ActionButton>
              ) : null}
              {node.canEdit ? (
                <ActionButton
                  className={isReply ? "h-7 px-2.5 text-[10px]" : undefined}
                  onClick={() => {
                    setActiveReplyId(null)
                    setActiveReportId(null)
                    setActiveEditId(isEditing ? null : node.id)
                  }}
                >
                  <PencilLine className="size-3.5" />
                  Edit
                </ActionButton>
              ) : null}
              {node.canDelete ? (
                <ActionButton className={isReply ? "h-7 px-2.5 text-[10px]" : undefined} onClick={handleDelete}>
                  <Trash2 className="size-3.5" />
                  Delete
                </ActionButton>
              ) : null}
              {node.canReport ? (
                <ActionButton
                  className={isReply ? "h-7 px-2.5 text-[10px]" : undefined}
                  onClick={() => {
                    setActiveEditId(null)
                    setActiveReplyId(null)
                    setActiveReportId(isReporting ? null : node.id)
                  }}
                >
                  <Flag className="size-3.5" />
                  Report
                </ActionButton>
              ) : null}
            </div>
          )}
        </div>

        <p
          className={cn(
            "whitespace-pre-wrap font-[family-name:var(--font-reading)] text-foreground/88",
            isReply ? "text-[0.98rem] leading-[1.75]" : "text-[1.06rem] leading-[1.95]",
            node.isRemoved && "italic text-muted-foreground",
          )}
        >
          {node.isRemoved ? "Comment removed." : node.body}
        </p>

        {isEditing ? (
          <div className={cn("border border-primary/12 bg-background/72", isReply ? "rounded-[1.15rem] p-3" : "rounded-[1.6rem] p-4")}>
            <CommentComposer
              defaultBody={node.body}
              defaultDisplayName={viewer.defaultDisplayName}
              isPending={isMutating}
              onCancel={() => setActiveEditId(null)}
              onSubmit={({ body }) => onEdit(node.id, body)}
              showDisplayName={false}
              submitLabel="Save edit"
              tone="subtle"
            />
          </div>
        ) : null}

        {isReplying ? (
          <div className={cn("border border-primary/12 bg-background/72", isReply ? "rounded-[1.15rem] p-3" : "rounded-[1.6rem] p-4")}>
            <CommentComposer
              defaultDisplayName={viewer.defaultDisplayName}
              isPending={isMutating}
              onCancel={() => setActiveReplyId(null)}
              onSubmit={({ body, displayName }) => onReply(node.id, body, displayName)}
              showDisplayName={true}
              submitLabel="Post reply"
              tone="subtle"
            />
          </div>
        ) : null}

        {isReporting ? (
          <ReportForm
            commentId={node.id}
            isPending={isMutating}
            onCancel={() => setActiveReportId(null)}
            onSubmit={onReport}
          />
        ) : null}

        {node.replies.length > 0 ? (
          <div className="relative mt-1 space-y-2.5 pl-3 before:absolute before:bottom-2 before:left-0 before:top-2 before:w-px before:bg-border/70 sm:pl-4">
            <div className="flex items-center gap-2 pl-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              <MessageSquareQuote className="size-3.5 text-primary" />
              {node.replies.length} {node.replies.length === 1 ? "response" : "responses"}
            </div>

            {node.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                activeEditId={activeEditId}
                activeReportId={activeReportId}
                activeReplyId={activeReplyId}
                depth={1}
                mutationKey={mutationKey}
                node={reply}
                onDelete={onDelete}
                onEdit={onEdit}
                onReport={onReport}
                onReply={onReply}
                setActiveEditId={setActiveEditId}
                setActiveReportId={setActiveReportId}
                setActiveReplyId={setActiveReplyId}
                viewer={viewer}
              />
            ))}
          </div>
        ) : null}
      </div>
    </article>
  )
}

export function CommentsClient({
  comments,
  currentPath,
  isConfigured,
  noticeMessage,
  postSlug,
  totalVisibleComments,
  viewer,
}: CommentsClientProps) {
  const router = useRouter()
  const [flash, setFlash] = useState<FlashState | null>(
    noticeMessage ? { kind: "success", text: noticeMessage } : null,
  )
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null)
  const [activeEditId, setActiveEditId] = useState<string | null>(null)
  const [activeReportId, setActiveReportId] = useState<string | null>(null)
  const [mutationKey, setMutationKey] = useState<string | null>(null)
  const [isRefreshing, startRefresh] = useTransition()

  useEffect(() => {
    if (noticeMessage) {
      setFlash({ kind: "success", text: noticeMessage })
    }
  }, [noticeMessage])

  async function refreshAfter(message: string) {
    setFlash({ kind: "success", text: message })
    startRefresh(() => {
      router.refresh()
    })
  }

  async function handleCreate(body: string, displayName: string, parentId?: string) {
    setMutationKey(parentId ?? "root")

    try {
      await requestJson("/api/comments", {
        body: JSON.stringify({ body, displayName, parentId, postSlug }),
        method: "POST",
      })

      setActiveReplyId(null)
      await refreshAfter(parentId ? "Reply posted." : "Comment posted.")
    } finally {
      setMutationKey(null)
    }
  }

  async function handleEdit(commentId: string, body: string) {
    setMutationKey(commentId)

    try {
      await requestJson(`/api/comments/${commentId}`, {
        body: JSON.stringify({ body }),
        method: "PATCH",
      })

      setActiveEditId(null)
      await refreshAfter("Comment updated.")
    } finally {
      setMutationKey(null)
    }
  }

  async function handleDelete(commentId: string) {
    setMutationKey(commentId)

    try {
      await requestJson(`/api/comments/${commentId}`, {
        method: "DELETE",
      })

      setActiveEditId(null)
      setActiveReplyId(null)
      await refreshAfter("Comment removed.")
    } finally {
      setMutationKey(null)
    }
  }

  async function handleReport(commentId: string, reason: CommentReportReason, details: string) {
    setMutationKey(commentId)

    try {
      await requestJson(`/api/comments/${commentId}/report`, {
        body: JSON.stringify({ details, reason }),
        method: "POST",
      })

      setActiveReportId(null)
      await refreshAfter("Report sent for review.")
    } finally {
      setMutationKey(null)
    }
  }

  const showTopLevelComposer = isConfigured && viewer.canComment && viewer.isAuthenticated

  return (
    <div className="comments-stage relative overflow-hidden rounded-[2.5rem] border border-primary/10 p-5 sm:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
      />

      <div className="relative space-y-7">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                <Sparkles className="size-3.5" />
                Reader salon
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <ShieldCheck className="size-3.5 text-primary" />
                Verified by email
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-[2.8rem]">
                Comments that feel like part of the essay, not an afterthought.
              </h2>
              <p className="max-w-2xl text-[1rem] leading-8 text-foreground/75">
                Readers can respond, disagree, refine, and build on the argument. Plain-text only,
                links blocked for new commenters, repeated abuse reports can auto-hide a comment.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatChip icon={<MessageSquareQuote className="size-3.5" />} label={`${totalVisibleComments} visible`} />
            <StatChip icon={<CornerDownRight className="size-3.5" />} label="single-level replies" />
            {viewer.isAuthenticated ? (
              <form action="/auth/signout" method="post">
                <input name="next" type="hidden" value={currentPath} />
                <Button className="rounded-full" type="submit" variant="outline">
                  Sign out
                </Button>
              </form>
            ) : null}
          </div>
        </div>

        <FlashBanner flash={flash} />

        {!isConfigured ? (
          <div className="comments-paper rounded-[2rem] border border-border/70 px-6 py-7 text-sm leading-7 text-muted-foreground">
            Add the Supabase environment variables and run the SQL in `supabase/comments.sql` to
            turn this section on.
          </div>
        ) : showTopLevelComposer ? (
          <div className="comments-paper relative overflow-hidden rounded-[2rem] border border-primary/12 p-6 sm:p-7">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-primary/12 via-transparent to-chart-1/12"
            />

            <div className="relative space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/12 bg-background/70 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                    <Sparkles className="size-3.5" />
                    Join the conversation
                  </div>
                  <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                    Posting as <span className="font-semibold text-foreground">{viewer.defaultDisplayName}</span>
                    {viewer.email ? (
                      <span>
                        {" "}
                        with <span className="font-medium text-foreground/80">{viewer.email}</span>
                      </span>
                    ) : null}
                    .
                  </p>
                </div>

                <div className="rounded-[1.3rem] border border-border/70 bg-background/72 px-4 py-3 text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Writing rules
                  </p>
                  <p className="mt-1 text-sm text-foreground/70">Specific &gt; loud. Useful &gt; fast.</p>
                </div>
              </div>

              <CommentComposer
                defaultDisplayName={viewer.defaultDisplayName}
                isPending={mutationKey === "root" || isRefreshing}
                onSubmit={({ body, displayName }) => handleCreate(body, displayName)}
                showDisplayName={true}
                submitLabel="Post comment"
              />
            </div>
          </div>
        ) : viewer.isBanned ? (
          <div className="comments-paper rounded-[2rem] border border-destructive/20 bg-destructive/8 p-6 text-sm leading-7 text-destructive">
            This account has been blocked from posting comments.
          </div>
        ) : (
          <div className="comments-paper rounded-[2rem] border border-border/70 p-6 sm:p-7">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/72 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  <ShieldCheck className="size-3.5 text-primary" />
                  Sign in to comment
                </div>
                <h3 className="text-2xl font-semibold tracking-tight">Verify once, then speak plainly.</h3>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                  Use a magic link so each comment is tied to a verified email address before it
                  enters the thread.
                </p>
              </div>

              <div className="rounded-[1.3rem] border border-border/70 bg-background/72 px-4 py-3 text-sm text-muted-foreground">
                No password required
              </div>
            </div>

            <form action="/auth/email" className="mt-6 flex flex-col gap-3 sm:flex-row" method="post">
              <input name="next" type="hidden" value={currentPath} />
              <Input
                autoComplete="email"
                className="h-12 rounded-full border-border/70 bg-background/78 px-5 shadow-none sm:flex-1"
                name="email"
                placeholder="you@example.com"
                required
                type="email"
              />
              <Button className="h-12 rounded-full px-6" type="submit">
                Send magic link
              </Button>
            </form>
          </div>
        )}

        {comments.length > 0 ? (
          <div className="space-y-5">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                activeEditId={activeEditId}
                activeReportId={activeReportId}
                activeReplyId={activeReplyId}
                depth={0}
                mutationKey={mutationKey}
                node={comment}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onReport={handleReport}
                onReply={(parentId, body, displayName) => handleCreate(body, displayName, parentId)}
                setActiveEditId={setActiveEditId}
                setActiveReportId={setActiveReportId}
                setActiveReplyId={setActiveReplyId}
                viewer={viewer}
              />
            ))}
          </div>
        ) : (
          <div className="comments-paper rounded-[2rem] border border-dashed border-border/80 px-6 py-12 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              Empty thread
            </p>
            <p className="mt-3 font-[family-name:var(--font-reading)] text-[1.08rem] leading-8 text-muted-foreground">
              No comments yet. The first thoughtful response sets the tone for everyone after it.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
