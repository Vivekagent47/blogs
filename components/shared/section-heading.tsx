import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b border-primary/15 pb-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl space-y-2">
        {eyebrow ? (
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{title}</h1>
        {description ? <p className="text-sm leading-7 text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
