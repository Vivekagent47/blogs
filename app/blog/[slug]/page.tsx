import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ArticleHeader } from "@/components/post/article-header"
import { CommentsSection } from "@/components/comments/comments-section"
import { PrevNextLinks } from "@/components/post/prev-next-links"
import { Prose } from "@/components/prose/prose"
import { getAdjacentEntries, getCollectionSlugs, getEntryBySlug } from "@/lib/content"
import { renderMdx } from "@/lib/mdx"
import { buildPageMetadata, buildPostMetadata } from "@/lib/seo"

type Params = {
  slug: string
}

export function generateStaticParams() {
  return getCollectionSlugs("blog", { includeDrafts: false }).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const entry = getEntryBySlug("blog", slug)

  if (!entry) {
    return buildPageMetadata({
      title: "Post not found",
      description: "The requested blog post could not be found.",
      path: `/blog/${slug}`,
      noIndex: true,
    })
  }

  return buildPostMetadata({
    title: entry.title,
    description: entry.description,
    path: `/blog/${entry.slug}`,
    publishedTime: entry.date,
    modifiedTime: entry.updatedAt,
    section: "Blog",
    tags: entry.tags,
    image: entry.coverImage,
    noIndex: entry.draft,
  })
}

export default async function BlogEntryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams])
  const entry = getEntryBySlug("blog", slug)

  if (!entry) {
    notFound()
  }

  const [content, { previous, next }] = await Promise.all([
    renderMdx(entry.body),
    Promise.resolve(getAdjacentEntries("blog", slug)),
  ])

  return (
    <div className="space-y-10">
      <ArticleHeader entry={entry} />

      <Prose>{content}</Prose>

      <CommentsSection entry={entry} notice={resolvedSearchParams.comments_notice} />

      <PrevNextLinks previous={previous} next={next} />
    </div>
  )
}
