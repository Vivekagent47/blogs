import type { MetadataRoute } from "next"

import { getPublishedEntries } from "@/lib/content"
import { absoluteUrl } from "@/lib/seo"

const staticRoutes = [
  { path: "/", priority: 1, changeFrequency: "weekly" as const },
  { path: "/blog", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/notes", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/rants", priority: 0.7, changeFrequency: "weekly" as const },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const contentRoutes: MetadataRoute.Sitemap = getPublishedEntries().map((entry) => ({
    url: absoluteUrl(entry.url),
    lastModified: new Date(`${entry.updatedAt ?? entry.date}T00:00:00.000Z`),
    changeFrequency: "monthly",
    priority: entry.type === "blog" ? 0.8 : entry.type === "notes" ? 0.7 : 0.6,
  }))

  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route.path),
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...contentRoutes,
  ]
}
