import type { Metadata } from "next"

export const siteConfig = {
  name: "Vivek Chauhan",
  title: "Vivek Chauhan",
  description: "Personal writing on software, systems, notes, and occasional rants.",
  author: "Vivek Chauhan",
  locale: "en_US",
  ogImage: "/og-default.svg",
}

function normalizeBaseUrl(rawValue: string) {
  if (rawValue.startsWith("http://") || rawValue.startsWith("https://")) {
    return rawValue
  }

  return `https://${rawValue}`
}

export function getSiteOrigin() {
  const fallback = "http://localhost:3000"
  const rawValue =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : fallback)

  return new URL(normalizeBaseUrl(rawValue)).toString()
}

export function absoluteUrl(pathname = "/") {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`
  return new URL(normalizedPath, getSiteOrigin()).toString()
}

type MetadataInput = {
  title: string
  description?: string
  path: string
  image?: string
  noIndex?: boolean
}

type PostMetadataInput = MetadataInput & {
  publishedTime: string
  modifiedTime?: string
  section?: string
  tags?: string[]
}

function buildBaseMetadata({
  title,
  description = siteConfig.description,
  path,
  image = siteConfig.ogImage,
  noIndex = false,
}: MetadataInput): Metadata {
  const canonical = absoluteUrl(path)
  const imageUrl = absoluteUrl(image)

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      type: "website",
      locale: siteConfig.locale,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
  }
}

export function buildRootMetadata(): Metadata {
  return {
    metadataBase: new URL(getSiteOrigin()),
    title: {
      default: siteConfig.title,
      template: `%s | ${siteConfig.title}`,
    },
    description: siteConfig.description,
    openGraph: {
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
      title: siteConfig.title,
      description: siteConfig.description,
      url: absoluteUrl("/"),
      images: [
        {
          url: absoluteUrl(siteConfig.ogImage),
          width: 1200,
          height: 630,
          alt: siteConfig.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.title,
      description: siteConfig.description,
      images: [absoluteUrl(siteConfig.ogImage)],
    },
  }
}

export function buildPageMetadata(input: MetadataInput): Metadata {
  return buildBaseMetadata(input)
}

export function buildPostMetadata({
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  ...base
}: PostMetadataInput): Metadata {
  const metadata = buildBaseMetadata(base)

  return {
    ...metadata,
    keywords: tags,
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: new Date(`${publishedTime}T00:00:00.000Z`).toISOString(),
      modifiedTime: new Date(`${(modifiedTime ?? publishedTime)}T00:00:00.000Z`).toISOString(),
      section,
      authors: [siteConfig.author],
      tags,
    },
  }
}

type RssEntry = {
  title: string
  description: string
  url: string
  date: string
  updatedAt?: string
  tags?: string[]
  section?: string
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}

function toRfc822Date(rawDate: string) {
  return new Date(`${rawDate}T00:00:00.000Z`).toUTCString()
}

export function buildRssFeedXml(entries: RssEntry[]) {
  const feedEntries = [...entries].sort((left, right) => {
    const leftTime = new Date(`${left.date}T00:00:00.000Z`).getTime()
    const rightTime = new Date(`${right.date}T00:00:00.000Z`).getTime()
    return rightTime - leftTime
  })

  const latestBuildDate =
    feedEntries[0]?.updatedAt ?? feedEntries[0]?.date ?? new Date().toISOString().slice(0, 10)

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.title)}</title>
    <description>${escapeXml(siteConfig.description)}</description>
    <link>${escapeXml(absoluteUrl("/"))}</link>
    <atom:link href="${escapeXml(absoluteUrl("/rss.xml"))}" rel="self" type="application/rss+xml" />
    <language>en-US</language>
    <lastBuildDate>${toRfc822Date(latestBuildDate)}</lastBuildDate>
${feedEntries
  .map((entry) => {
    const categories = [entry.section, ...(entry.tags ?? [])]
      .filter((tag): tag is string => Boolean(tag))
      .map((tag) => `      <category>${escapeXml(tag)}</category>`)
      .join("\n")

    return `    <item>
      <title>${escapeXml(entry.title)}</title>
      <description>${escapeXml(entry.description)}</description>
      <link>${escapeXml(entry.url)}</link>
      <guid isPermaLink="true">${escapeXml(entry.url)}</guid>
      <pubDate>${toRfc822Date(entry.date)}</pubDate>
      <lastBuildDate>${toRfc822Date(entry.updatedAt ?? entry.date)}</lastBuildDate>
${categories ? `${categories}\n` : ""}    </item>`
  })
  .join("\n")}
  </channel>
</rss>`
}
