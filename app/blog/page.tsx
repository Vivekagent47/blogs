import type { Metadata } from "next"
import Link from "next/link"

import { PostCard } from "@/components/post/post-card"
import { SectionHeading } from "@/components/shared/section-heading"
import { collectionDescriptions, collectionLabels, collectionRoutes, getCollection } from "@/lib/content"
import { buildPageMetadata } from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata({
  title: "Blog",
  description: collectionDescriptions.blog,
  path: "/blog",
})

export default function BlogIndexPage() {
  const entries = getCollection("blog")

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-primary/15 bg-gradient-to-br from-secondary/60 via-card to-card p-6">
        <SectionHeading
          eyebrow={collectionLabels.blog}
          title="Long-form posts"
          description={collectionDescriptions.blog}
          action={
            <Link href="/" className="text-sm font-medium text-primary hover:underline">
              Back home
            </Link>
          }
        />
      </section>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {entries.map((entry) => (
          <PostCard key={entry.slug} entry={entry} href={`${collectionRoutes.blog}/${entry.slug}`} />
        ))}
      </div>
    </div>
  )
}
