import type { LucideIcon } from "lucide-react"
import { Globe2, Mail, Rss } from "lucide-react"

import { cn } from "@/lib/utils"

const links: Array<{
  label: string
  href: string
  icon: LucideIcon
}> = [
  {
    label: "GitHub",
    href: "https://github.com/vivekagent47",
    icon: Globe2,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/itsvivekchauhan/",
    icon: Globe2,
  },
  {
    label: "Email",
    href: "mailto:vivekc0679@gmail.com",
    icon: Mail,
  },
  {
    label: "RSS",
    href: "/rss.xml",
    icon: Rss,
  },
]

export function SocialLinks({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {links.map(({ label, href, icon: Icon }) => (
        <a
          key={label}
          href={href}
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-primary/20 bg-background/85 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:-translate-y-0.5 hover:border-primary/35 hover:text-primary"
          target={href.startsWith("/") ? undefined : "_blank"}
          rel={href.startsWith("/") ? undefined : "noreferrer"}
        >
          <Icon className="size-3.5" />
          <span>{label}</span>
        </a>
      ))}
    </div>
  )
}
