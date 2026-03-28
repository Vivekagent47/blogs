import "server-only"

import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypePrettyCode from "rehype-pretty-code"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"
import { compileMDX } from "next-mdx-remote/rsc"

import { mdxComponents } from "@/components/prose/mdx-components"

const prettyCodeOptions = {
  theme: {
    dark: "github-dark",
    light: "github-light",
  },
  keepBackground: false,
} as const

export async function renderMdx(source: string) {
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "append",
              properties: {
                className: ["heading-anchor"],
                ariaLabel: "Link to heading",
              },
              content: {
                type: "text",
                value: "#",
              },
            },
          ],
          [rehypePrettyCode, prettyCodeOptions],
        ],
      },
    },
  })

  return content
}
