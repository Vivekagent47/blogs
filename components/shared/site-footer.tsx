import Link from "next/link"

import { collectionRoutes } from "@/lib/content"

import { Container } from "./container"
import { SocialLinks } from "./social-links"

const footerNav = [
  { href: collectionRoutes.blog, label: "Blog" },
] as const

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-primary/15 bg-secondary/35">
      <Container className="py-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl space-y-3">
            <p className="text-sm font-medium text-primary">Blogs</p>
            <p className="text-sm leading-7 text-muted-foreground">
              A compact publishing surface for essays and technical writing that do not need to be
              larger than they are.
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {footerNav.map((item) => (
                <Link key={item.href} href={item.href} className="transition hover:text-primary">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <SocialLinks />
            <p className="text-xs text-muted-foreground">
              Built with Next.js, MDX, and a preference for small, readable routes.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  )
}
