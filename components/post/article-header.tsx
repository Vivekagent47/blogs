import { collectionLabels, type ContentEntry } from "@/lib/content"

import { PostMeta } from "./post-meta"

export function ArticleHeader({ entry }: { entry: ContentEntry }) {
  return (
    <header className="space-y-7 rounded-3xl border border-primary/12 bg-gradient-to-br from-secondary/70 via-card to-card p-6 sm:p-8">
      <div className="space-y-4">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-primary">
          {collectionLabels[entry.collection]}
        </p>
        <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-5xl">
          {entry.title}
        </h1>
        <p className="max-w-3xl text-lg leading-9 text-foreground/85">{entry.description}</p>
      </div>
      <PostMeta entry={entry} />
    </header>
  )
}
