import { getPublishedEntries } from "@/lib/content"
import { absoluteUrl, buildRssFeedXml } from "@/lib/seo"

export const dynamic = "force-static"

export function GET() {
  const entries = getPublishedEntries().map((entry) => ({
    title: entry.title,
    description: entry.description,
    url: absoluteUrl(entry.url),
    date: entry.date,
    updatedAt: entry.updatedAt,
    tags: entry.tags,
    section: entry.type,
  }))

  const xml = buildRssFeedXml(entries)

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
