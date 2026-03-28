import { collectionLabels, formatDate, type ContentEntry } from "@/lib/content"

import { ReadingTime } from "./reading-time"
import { TagList } from "./tag-list"

export function PostMeta({ entry }: { entry: ContentEntry }) {
  const displayDate = entry.updatedAt ?? entry.date
  const displayLabel = entry.updatedAt ? "Updated" : "Published"

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
        <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 font-medium uppercase tracking-[0.2em] text-primary">
          {collectionLabels[entry.collection]}
        </span>
        <span>
          {displayLabel} {formatDate(displayDate)}
        </span>
        <ReadingTime value={entry.readingTimeText} />
      </div>
      <TagList tags={entry.tags} />
    </div>
  )
}
