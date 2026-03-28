import { cn } from "@/lib/utils"

export function TagList({
  tags,
  className,
}: {
  tags: string[]
  className?: string
}) {
  if (tags.length === 0) {
    return null
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center rounded-full border border-secondary-foreground/10 bg-secondary/75 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-secondary-foreground"
        >
          {tag}
        </span>
      ))}
    </div>
  )
}
