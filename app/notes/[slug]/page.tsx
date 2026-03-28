import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ArticleHeader } from "@/components/post/article-header"
import { PrevNextLinks } from "@/components/post/prev-next-links"
import { Prose } from "@/components/prose/prose"
import { getAdjacentEntries, getCollectionSlugs, getEntryBySlug } from "@/lib/content"
import { renderMdx } from "@/lib/mdx"
import { buildPageMetadata, buildPostMetadata } from "@/lib/seo"

type Params = {
  slug: string
}

export function generateStaticParams() {
  return getCollectionSlugs("notes", { includeDrafts: false }).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const entry = getEntryBySlug("notes", slug)

  if (!entry) {
    return buildPageMetadata({
      title: "Note not found",
      description: "The requested note could not be found.",
      path: `/notes/${slug}`,
      noIndex: true,
    })
  }

  return buildPostMetadata({
    title: entry.title,
    description: entry.description,
    path: `/notes/${entry.slug}`,
    publishedTime: entry.date,
    modifiedTime: entry.updatedAt,
    section: "Notes",
    tags: entry.tags,
    image: entry.coverImage,
    noIndex: entry.draft,
  })
}

export default async function NotesEntryPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  const entry = getEntryBySlug("notes", slug)

  if (!entry) {
    notFound()
  }

  const content = await renderMdx(entry.body)
  const { previous, next } = getAdjacentEntries("notes", slug)

  return (
    <div className="space-y-10">
      <ArticleHeader entry={entry} />

      <Prose>{content}</Prose>

      <PrevNextLinks previous={previous} next={next} />
    </div>
  )
}
