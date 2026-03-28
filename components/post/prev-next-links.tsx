import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { type ContentEntry } from "@/lib/content"
import { cn } from "@/lib/utils"

export function PrevNextLinks({
  previous,
  next,
  previousLabel = "Previous",
  nextLabel = "Next",
  className,
}: {
  previous: ContentEntry | null
  next: ContentEntry | null
  previousLabel?: string
  nextLabel?: string
  className?: string
}) {
  if (!previous && !next) {
    return null
  }

  return (
    <nav className={cn("grid gap-4 border-t border-primary/15 pt-8 sm:grid-cols-2", className)}>
      {previous ? (
        <Link
          href={`/${previous.collection}/${previous.slug}`}
          className="group rounded-3xl border border-primary/15 bg-gradient-to-br from-secondary/65 via-card to-card p-4 transition hover:border-primary/30 hover:bg-secondary/55"
        >
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-primary">
            <ArrowLeft className="size-3.5" />
            {previousLabel}
          </div>
          <div className="mt-3 space-y-2">
            <p className="text-sm font-medium text-foreground">{previous.title}</p>
            <p className="text-sm leading-6 text-muted-foreground">{previous.description}</p>
          </div>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={`/${next.collection}/${next.slug}`}
          className="group rounded-3xl border border-primary/15 bg-gradient-to-br from-secondary/65 via-card to-card p-4 text-right transition hover:border-primary/30 hover:bg-secondary/55"
        >
          <div className="flex items-center justify-end gap-2 text-xs uppercase tracking-[0.24em] text-primary">
            {nextLabel}
            <ArrowRight className="size-3.5" />
          </div>
          <div className="mt-3 space-y-2">
            <p className="text-sm font-medium text-foreground">{next.title}</p>
            <p className="text-sm leading-6 text-muted-foreground">{next.description}</p>
          </div>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  )
}
