"use client"

import {
  useEffect,
  useState,
} from "react"
import { useSearchParams } from "next/navigation"

import { getCommentNoticeMessage } from "@/lib/comments/notices"
import type { CommentsSectionData } from "@/lib/comments/types"

import { CommentsClient } from "./comments-client"
import {
  CommentsSectionFallback,
  CommentsSectionUnavailable,
} from "./comments-section-fallback"

async function fetchCommentsSectionData(postSlug: string) {
  const response = await fetch(`/api/comments?postSlug=${encodeURIComponent(postSlug)}`, {
    cache: "no-store",
    credentials: "same-origin",
  })

  if (!response.ok) {
    throw new Error("Unable to load comments.")
  }

  return (await response.json()) as CommentsSectionData
}

export function CommentsSection({
  commentsEnabled,
  currentPath,
  postSlug,
}: {
  commentsEnabled: boolean
  currentPath: string
  postSlug: string
}) {
  const searchParams = useSearchParams()
  const [data, setData] = useState<CommentsSectionData | null>(null)
  const [hasError, setHasError] = useState(false)
  const noticeMessage = getCommentNoticeMessage(searchParams.get("comments_notice") ?? undefined)

  async function refreshData() {
    try {
      const nextData = await fetchCommentsSectionData(postSlug)
      setData(nextData)
      setHasError(false)
    } catch (error) {
      console.error(error)
      if (!data) {
        setHasError(true)
      }
    }
  }

  useEffect(() => {
    if (!commentsEnabled) {
      return
    }

    let cancelled = false

    async function loadInitialData() {
      try {
        const nextData = await fetchCommentsSectionData(postSlug)
        if (cancelled) {
          return
        }

        setData(nextData)
        setHasError(false)
      } catch (error) {
        if (cancelled) {
          return
        }

        console.error(error)
        setHasError(true)
      }
    }

    void loadInitialData()

    return () => {
      cancelled = true
    }
  }, [commentsEnabled, postSlug])

  if (!commentsEnabled) {
    return null
  }

  if (!data) {
    return hasError ? <CommentsSectionUnavailable /> : <CommentsSectionFallback />
  }

  return (
    <section id="comments" className="space-y-6 scroll-m-24">
      <CommentsClient
        comments={data.comments}
        currentPath={currentPath}
        isConfigured={data.isConfigured}
        noticeMessage={noticeMessage}
        onRefresh={refreshData}
        postSlug={postSlug}
        totalVisibleComments={data.totalVisibleComments}
        viewer={data.viewer}
      />
    </section>
  )
}
