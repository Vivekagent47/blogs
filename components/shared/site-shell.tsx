import type { ReactNode } from "react"

import { Container } from "./container"
import { SiteFooter } from "./site-footer"
import { SiteHeader } from "./site-header"

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="shell-aurora relative min-h-dvh overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[18rem] bg-gradient-to-b from-secondary/45 via-secondary/20 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-10rem] top-36 size-80 rounded-full bg-primary/20 blur-3xl dark:bg-primary/25"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-8rem] top-[26rem] size-[24rem] rounded-full bg-secondary/70 blur-3xl dark:bg-secondary/30"
      />

      <div className="relative flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex-1">
          <Container className="py-8 md:py-12">{children}</Container>
        </main>
        <SiteFooter />
      </div>
    </div>
  )
}
