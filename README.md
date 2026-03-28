# Personal Publishing Website

A content-first personal site built with Next.js App Router, TypeScript, Tailwind CSS, and MDX.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS + existing shadcn theme tokens
- MDX content files in `content/`
- RSS feed at `/rss.xml`
- Sitemap at `/sitemap.xml`

## Run locally

```bash
bun install
bun run dev
```

## Content model

All published writing is file-based MDX:

- `content/blog/*.mdx`

Required frontmatter fields:

```yaml
title: "Post title"
description: "Short summary for cards and SEO"
date: "YYYY-MM-DD"
updatedAt: "YYYY-MM-DD" # optional
tags:
  - tag-one
  - tag-two
draft: false
coverImage: "/images/example.jpg" # optional
```

## Publishing workflow

1. Add a new `.mdx` file in `content/blog`.
2. Use a unique file name; it becomes the URL slug.
3. Set `draft: false` to publish.

Draft behavior:

- Development: drafts are visible.
- Production: drafts are excluded from lists, routes, RSS, and sitemap.

## Quality checks

```bash
bun run typecheck
bun run lint
bun run build
```
