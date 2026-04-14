import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-2xl border border-border bg-background/90 px-4 text-sm text-foreground shadow-sm transition-colors outline-none placeholder:text-muted-foreground/80 focus:border-primary/40 focus:ring-2 focus:ring-primary/10",
        className,
      )}
      {...props}
    />
  )
}
