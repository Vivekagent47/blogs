import type { ComponentPropsWithoutRef } from "react"

import Link from "next/link"
import type { MDXComponents } from "mdx/types"

import { Callout } from "@/components/ui/callout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function Anchor({ href = "", children, ...props }: ComponentPropsWithoutRef<"a">) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" {...props}>
      {children}
    </a>
  )
}

function Pre(props: ComponentPropsWithoutRef<"pre">) {
  return <pre {...props} />
}

function Code(props: ComponentPropsWithoutRef<"code">) {
  return <code {...props} />
}

export const mdxComponents: MDXComponents = {
  a: Anchor,
  pre: Pre,
  code: Code,
  Callout,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
}
