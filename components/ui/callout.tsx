import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type CalloutType = "info" | "warning" | "success"

const calloutStyles: Record<CalloutType, string> = {
  info: "border-primary/25 bg-secondary/70 text-foreground",
  warning: "border-amber-500/40 bg-amber-500/10 text-foreground",
  success: "border-emerald-500/40 bg-emerald-500/10 text-foreground",
}

export function Callout({
  children,
  className,
  type = "info",
}: {
  children: ReactNode
  className?: string
  type?: CalloutType
}) {
  return (
    <aside
      className={cn(
        "my-8 rounded-2xl border px-5 py-4 text-sm leading-7",
        calloutStyles[type],
        className,
      )}
    >
      {children}
    </aside>
  )
}
