"use client"

import * as React from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"

type ThemeChoice = "light" | "dark" | "system"

const themeOptions: Array<{
  value: ThemeChoice
  label: string
  Icon: typeof Sun
}> = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
]

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-8 w-[164px] rounded-full border border-primary/20 bg-secondary/55" />
  }

  const currentTheme = (theme as ThemeChoice | undefined) ?? "system"

  return (
    <div className="inline-flex items-center rounded-full border border-primary/20 bg-secondary/60 p-1">
      {themeOptions.map(({ value, label, Icon }) => {
        const isActive = currentTheme === value

        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={cn(
              "inline-flex h-6 items-center gap-1.5 rounded-full px-2 text-xs font-medium transition",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background hover:text-primary",
            )}
            aria-label={`Use ${label.toLowerCase()} theme`}
            aria-pressed={isActive}
          >
            <Icon className="size-3.5" />
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
