import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function Prose({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <article
      className={cn(
        "mx-auto w-full max-w-[74ch]",
        "[&>*:first-child]:mt-0",
        "[&_h2]:group [&_h2]:mt-16 [&_h2]:scroll-m-24 [&_h2]:font-[family-name:var(--font-display)] [&_h2]:text-[1.85rem] [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-balance",
        "[&_h3]:group [&_h3]:mt-12 [&_h3]:scroll-m-24 [&_h3]:font-[family-name:var(--font-display)] [&_h3]:text-[1.5rem] [&_h3]:font-semibold [&_h3]:tracking-tight [&_h3]:text-balance",
        "[&_h4]:mt-8 [&_h4]:font-[family-name:var(--font-display)] [&_h4]:text-xl [&_h4]:font-semibold",
        "[&_p]:mt-7 [&_p]:font-[family-name:var(--font-reading)] [&_p]:text-[1.08rem] [&_p]:leading-[1.9] [&_p]:text-foreground/88 [&_p]:text-pretty",
        "[&_p:first-of-type]:text-[1.16rem] [&_p:first-of-type]:text-foreground/92",
        "[&_p+_p]:mt-7",
        "[&_ul]:mt-7 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ul]:font-[family-name:var(--font-reading)] [&_ul]:text-foreground/86",
        "[&_ol]:mt-7 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_ol]:font-[family-name:var(--font-reading)] [&_ol]:text-foreground/86",
        "[&_li]:leading-8",
        "[&_li>p]:mt-2",
        "[&_blockquote]:mt-10 [&_blockquote]:rounded-2xl [&_blockquote]:border [&_blockquote]:border-primary/20 [&_blockquote]:bg-secondary/65 [&_blockquote]:px-6 [&_blockquote]:py-5 [&_blockquote]:italic [&_blockquote]:text-foreground/94",
        "[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:decoration-primary/40 [&_a]:decoration-2 [&_a]:underline-offset-4 hover:[&_a]:decoration-primary",
        "[&_strong]:font-semibold [&_strong]:text-foreground",
        "[&_hr]:my-12 [&_hr]:border-primary/15",
        "[&_pre]:my-8 [&_pre]:overflow-x-auto [&_pre]:rounded-3xl [&_pre]:border [&_pre]:border-primary/15 [&_pre]:bg-secondary/65 [&_pre]:p-4 [&_pre]:text-[0.92rem] [&_pre]:leading-7",
        "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit",
        "[&_code]:rounded [&_code]:bg-secondary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.88em]",
        "[&_pre_.line]:block [&_pre_.line]:px-2 [&_pre_.line]:py-0.5",
        "[&_pre_[data-line-numbers]]:[counter-reset:line] [&_pre_[data-line-numbers]>.line]:before:mr-4 [&_pre_[data-line-numbers]>.line]:before:inline-block [&_pre_[data-line-numbers]>.line]:before:w-4 [&_pre_[data-line-numbers]>.line]:before:text-right [&_pre_[data-line-numbers]>.line]:before:text-xs [&_pre_[data-line-numbers]>.line]:before:text-muted-foreground [&_pre_[data-line-numbers]>.line]:before:content-[counter(line)] [&_pre_[data-line-numbers]>.line]:before:[counter-increment:line]",
        "[&_.heading-anchor]:ml-2 [&_.heading-anchor]:text-primary/50 [&_.heading-anchor]:no-underline [&_.heading-anchor]:opacity-0 group-hover:[&_.heading-anchor]:opacity-100",
        "[&_table]:my-8 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm",
        "[&_th]:border-b [&_th]:border-primary/20 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold",
        "[&_td]:border-b [&_td]:border-primary/10 [&_td]:px-3 [&_td]:py-2 [&_td]:text-muted-foreground",
        className,
      )}
    >
      {children}
    </article>
  )
}
