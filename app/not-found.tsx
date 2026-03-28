import type { Metadata } from "next"
import Link from "next/link"

import { buildPageMetadata } from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata({
  title: "Not Found",
  description: "This page does not exist.",
  path: "/404",
  noIndex: true,
})

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-start justify-center gap-6">
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">404</p>
        <h1 className="text-4xl font-semibold tracking-tight">Page not found</h1>
        <p className="max-w-xl text-sm leading-8 text-muted-foreground">
          The route you were looking for does not exist. Use the links below to get back to the
          writing.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex items-center rounded-full border border-foreground/15 bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:bg-foreground/90"
        >
          Home
        </Link>
        <Link
          href="/blog"
          className="inline-flex items-center rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          Blog
        </Link>
      </div>
    </div>
  )
}
