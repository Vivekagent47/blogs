import type { ContentEntry } from "@/lib/content"
import { isCommentsEnabled } from "@/lib/content"
import { getCommentNoticeMessage } from "@/lib/comments/notices"
import { getCommentsSectionData } from "@/lib/comments/server"

import { CommentsClient } from "./comments-client"

export async function CommentsSection({
  entry,
  notice,
}: {
  entry: ContentEntry
  notice?: string | string[]
}) {
  if (!isCommentsEnabled(entry)) {
    return null
  }

  const noticeMessage = getCommentNoticeMessage(notice)
  let data: Awaited<ReturnType<typeof getCommentsSectionData>> | null = null

  try {
    data = await getCommentsSectionData(entry.slug)
  } catch (error) {
    console.error(error)
  }

  if (!data) {
    return (
      <section id="comments" className="comments-stage scroll-m-24 space-y-4 rounded-[2.5rem] border border-primary/10 p-6 sm:p-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            Discussion
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">Comments temporarily unavailable</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            The article is fine, but the comments backend is not ready yet. Check the server logs and
            Supabase setup if this should already be online.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section id="comments" className="space-y-6 scroll-m-24">
      <CommentsClient
        comments={data.comments}
        currentPath={entry.url}
        isConfigured={data.isConfigured}
        noticeMessage={noticeMessage}
        postSlug={entry.slug}
        totalVisibleComments={data.totalVisibleComments}
        viewer={data.viewer}
      />
    </section>
  )
}
