import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-32 w-full rounded-2xl border border-border bg-background/90 px-4 py-3 text-sm leading-7 text-foreground shadow-sm transition-colors outline-none placeholder:text-muted-foreground/80 focus:border-primary/40 focus:ring-2 focus:ring-primary/10",
        className,
      )}
      {...props}
    />
  )
}
