import type { Metadata } from "next"
import Link from "next/link"

import { PostCard } from "@/components/post/post-card"
import { SectionHeading } from "@/components/shared/section-heading"
import { collectionRoutes, getAllTags, getCollection, getCollectionStats } from "@/lib/content"
import { buildPageMetadata } from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata({
  title: "Home",
  description: "Blogs, notes, rants, and personal updates by Vivek Chauhan.",
  path: "/",
})

export default function HomePage() {
  const featuredBlog = getCollection("blog")[0] ?? null
  const notes = getCollection("notes").slice(0, 3)
  const rants = getCollection("rants").slice(0, 3)
  const stats = getCollectionStats()
  const tags = getAllTags().slice(0, 12)

  return (
    <div className="space-y-16">
      <section className="grid gap-8 rounded-[2rem] border border-primary/15 bg-gradient-to-br from-secondary/65 via-card to-card p-6 sm:p-8 lg:grid-cols-[1.35fr_0.9fr] lg:items-start">
        <div className="space-y-6">
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-primary">
            Vivek Chauhan
          </p>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
              Long-form blogs, quick notes, and occasional rants.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-muted-foreground">
              A personal publishing website focused on clarity, good reading rhythm, and simple
              architecture that stays maintainable over time.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={collectionRoutes.blog}
              className="inline-flex min-h-11 items-center rounded-full border border-primary/30 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Read the blog
            </Link>
            <Link
              href={collectionRoutes.notes}
              className="inline-flex min-h-11 items-center rounded-full border border-secondary-foreground/15 bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition hover:bg-secondary/85"
            >
              Browse notes
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {stats.map((stat) => (
            <article
              key={stat.collection}
              className="rounded-3xl border border-primary/15 bg-background/90 p-5 shadow-sm"
            >
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-primary">
                {stat.label}
              </p>
              <p className="mt-3 text-4xl font-semibold tracking-tight">{stat.count}</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{stat.description}</p>
              {stat.latest ? (
                <p className="mt-4 text-xs text-muted-foreground">
                  Latest: <span className="text-foreground">{stat.latest.title}</span>
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      {featuredBlog ? (
        <section className="space-y-6">
          <SectionHeading
            eyebrow="Featured"
            title="Latest blog post"
            description="The newest long-form piece from the blog collection."
          />
          <PostCard entry={featuredBlog} href={`${collectionRoutes.blog}/${featuredBlog.slug}`} />
        </section>
      ) : (
        <section className="rounded-3xl border border-primary/15 bg-secondary/60 p-6">
          <SectionHeading
            eyebrow="Start here"
            title="No published posts yet"
            description="Add your first MDX file under content/blog to publish your first article."
          />
        </section>
      )}

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <SectionHeading
            eyebrow="Field notes"
            title="Latest notes"
            description="Short learnings and findings in lightweight format."
            action={
              <Link href={collectionRoutes.notes} className="text-sm font-medium text-primary">
                View all notes
              </Link>
            }
          />
          <div className="space-y-4">
            {notes.length > 0 ? (
              notes.map((entry) => (
                <PostCard key={entry.slug} entry={entry} href={`${collectionRoutes.notes}/${entry.slug}`} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No notes yet. Add files in <code>content/notes</code>.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <SectionHeading
            eyebrow="Opinion"
            title="Latest rants"
            description="Personal takes with a sharper edge."
            action={
              <Link href={collectionRoutes.rants} className="text-sm font-medium text-primary">
                View all rants
              </Link>
            }
          />
          <div className="space-y-4">
            {rants.length > 0 ? (
              rants.map((entry) => (
                <PostCard key={entry.slug} entry={entry} href={`${collectionRoutes.rants}/${entry.slug}`} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No rants yet. Add files in <code>content/rants</code>.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-primary/15 bg-gradient-to-br from-secondary/60 via-card to-card p-6">
          <SectionHeading
            eyebrow="Topics"
            title="Tag stream"
            description="Recurring ideas across blog posts, notes, and rants."
          />
          {tags.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-secondary-foreground/10 bg-secondary px-3 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-secondary-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm text-muted-foreground">Tags will appear once you publish content.</p>
          )}
        </div>

        <div className="rounded-3xl border border-primary/15 bg-gradient-to-br from-secondary/60 via-card to-card p-6">
          <SectionHeading
            eyebrow="Quick links"
            title="Site sections"
            description="Primary writing collections."
          />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              { href: collectionRoutes.blog, label: "Blog", detail: "Long-form writing." },
              { href: collectionRoutes.notes, label: "Notes", detail: "Short-form updates." },
              { href: collectionRoutes.rants, label: "Rants", detail: "Opinionated posts." },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-primary/15 bg-background/95 p-4 transition hover:border-primary/30 hover:bg-secondary/45"
              >
                <p className="text-sm font-medium text-primary">{item.label}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.detail}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
