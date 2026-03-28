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
  return getCollectionSlugs("rants", { includeDrafts: false }).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const entry = getEntryBySlug("rants", slug)

  if (!entry) {
    return buildPageMetadata({
      title: "Rant not found",
      description: "The requested rant could not be found.",
      path: `/rants/${slug}`,
      noIndex: true,
    })
  }

  return buildPostMetadata({
    title: entry.title,
    description: entry.description,
    path: `/rants/${entry.slug}`,
    publishedTime: entry.date,
    modifiedTime: entry.updatedAt,
    section: "Rants",
    tags: entry.tags,
    image: entry.coverImage,
    noIndex: entry.draft,
  })
}

export default async function RantsEntryPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  const entry = getEntryBySlug("rants", slug)

  if (!entry) {
    notFound()
  }

  const content = await renderMdx(entry.body)
  const { previous, next } = getAdjacentEntries("rants", slug)

  return (
    <div className="space-y-10">
      <ArticleHeader entry={entry} />

      <Prose>{content}</Prose>

      <PrevNextLinks previous={previous} next={next} />
    </div>
  )
}
