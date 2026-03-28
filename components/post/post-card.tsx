import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { collectionLabels, formatDate, type ContentEntry } from "@/lib/content"
import { cn } from "@/lib/utils"

import { TagList } from "./tag-list"

export function PostCard({
  entry,
  href,
  className,
}: {
  entry: ContentEntry
  href: string
  className?: string
}) {
  const displayDate = entry.updatedAt ?? entry.date
  const displayLabel = entry.updatedAt ? "Updated" : "Published"

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-secondary/70 via-card to-card p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_22px_46px_-28px_rgba(0,0,0,0.35)]",
        "before:pointer-events-none before:absolute before:inset-x-5 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-primary/65 before:to-transparent",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
          {collectionLabels[entry.collection]}
        </span>
        <span className="text-xs text-muted-foreground">
          {displayLabel} {formatDate(displayDate)}
        </span>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-balance">{entry.title}</h2>
        <p className="text-sm leading-7 text-muted-foreground">{entry.description}</p>
      </div>

      <div className="mt-5 space-y-4">
        <TagList tags={entry.tags} />
        <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>{entry.readingTimeText}</span>
          <Link
            href={href}
            className="inline-flex min-h-10 items-center gap-1 rounded-full border border-primary/30 bg-background px-3 py-1.5 font-medium text-primary transition group-hover:border-primary/55 group-hover:bg-primary group-hover:text-primary-foreground"
          >
            Read
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  )
}
