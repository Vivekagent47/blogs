import Link from "next/link"

import { collectionRoutes } from "@/lib/content"
import { cn } from "@/lib/utils"

import { Container } from "./container"
import { ThemeSwitch } from "./theme-switch"

const primaryNav = [
  { href: "/", label: "Home" },
  { href: collectionRoutes.blog, label: "Blog" },
  { href: collectionRoutes.notes, label: "Notes" },
  { href: collectionRoutes.rants, label: "Rants" },
] as const

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-primary/15 bg-background/82 backdrop-blur-xl">
      <Container className="py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="group inline-flex items-baseline gap-2.5 self-start">
            <span className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
              Blogs
            </span>
            <span className="text-xs text-muted-foreground transition group-hover:text-primary">
              writing that stays small
            </span>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <nav className="flex flex-wrap gap-2 rounded-full border border-secondary/70 bg-secondary/45 p-1.5">
              {primaryNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full border border-transparent px-3 py-1.5 text-sm font-medium text-muted-foreground transition",
                    "hover:border-primary/20 hover:bg-background hover:text-primary",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <ThemeSwitch />
          </div>
        </div>
      </Container>
    </header>
  )
}
