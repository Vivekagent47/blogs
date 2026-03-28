import "server-only"

import fs from "node:fs"
import path from "node:path"

import matter from "gray-matter"
import readingTime from "reading-time"
import { cache } from "react"

export const collections = ["blog"] as const

export type CollectionName = (typeof collections)[number]

export type ContentFrontmatter = {
  title: string
  description: string
  date: string
  updatedAt?: string
  tags: string[]
  draft: boolean
  coverImage?: string
}

export type ContentEntry = ContentFrontmatter & {
  collection: CollectionName
  slug: string
  url: string
  body: string
  readingTimeText: string
  readingTimeMinutes: number
}

export type ContentListOptions = {
  includeDrafts?: boolean
}

export type PublishedEntry = {
  type: CollectionName
  url: string
  title: string
  description: string
  date: string
  updatedAt?: string
  tags: string[]
}

export const collectionLabels: Record<CollectionName, string> = {
  blog: "Blog",
}

export const collectionDescriptions: Record<CollectionName, string> = {
  blog: "Long-form writing about systems, software, and decisions that age well.",
}

export const collectionRoutes: Record<CollectionName, string> = {
  blog: "/blog",
}

const contentRoot = path.join(process.cwd(), "content")
const allowedExtensions = new Set([".md", ".mdx"])
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/
const utcDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
  timeZone: "UTC",
})

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function parseIsoDate(rawValue: unknown, filePath: string, fieldName: string): string {
  if (typeof rawValue !== "string" || !isoDatePattern.test(rawValue)) {
    throw new Error(`Invalid ${fieldName} in ${filePath}. Expected YYYY-MM-DD.`)
  }

  const parsed = new Date(`${rawValue}T00:00:00.000Z`)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid ${fieldName} in ${filePath}.`)
  }

  return rawValue
}

function normalizeTags(rawValue: unknown, filePath: string): string[] {
  if (rawValue === undefined) {
    return []
  }

  if (!Array.isArray(rawValue)) {
    throw new Error(`Invalid tags in ${filePath}. Expected an array of strings.`)
  }

  return rawValue
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function normalizeCoverImage(rawValue: unknown): string | undefined {
  if (typeof rawValue !== "string") {
    return undefined
  }

  const value = rawValue.trim()
  return value.length > 0 ? value : undefined
}

function parseFrontmatter(rawValue: unknown, filePath: string): ContentFrontmatter {
  if (!isObjectRecord(rawValue)) {
    throw new Error(`Invalid frontmatter in ${filePath}.`)
  }

  const title = typeof rawValue.title === "string" ? rawValue.title.trim() : ""
  const description =
    typeof rawValue.description === "string" ? rawValue.description.trim() : ""

  if (!title) {
    throw new Error(`Missing title in ${filePath}.`)
  }

  if (!description) {
    throw new Error(`Missing description in ${filePath}.`)
  }

  return {
    title,
    description,
    date: parseIsoDate(rawValue.date, filePath, "date"),
    updatedAt:
      rawValue.updatedAt === undefined
        ? undefined
        : parseIsoDate(rawValue.updatedAt, filePath, "updatedAt"),
    tags: normalizeTags(rawValue.tags, filePath),
    draft: rawValue.draft === true,
    coverImage: normalizeCoverImage(rawValue.coverImage),
  }
}

function resolveCollectionDirectory(collection: CollectionName) {
  return path.join(contentRoot, collection)
}

function walkContentFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) {
    return []
  }

  const entries = fs.readdirSync(directory, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      files.push(...walkContentFiles(absolutePath))
      continue
    }

    if (!entry.isFile()) {
      continue
    }

    if (allowedExtensions.has(path.extname(entry.name).toLowerCase())) {
      files.push(absolutePath)
    }
  }

  return files.sort((left, right) => left.localeCompare(right))
}

function shouldIncludeDrafts(options?: ContentListOptions) {
  if (typeof options?.includeDrafts === "boolean") {
    return options.includeDrafts
  }

  return process.env.NODE_ENV !== "production"
}

function resolveSlug(collection: CollectionName, filePath: string) {
  const collectionDirectory = resolveCollectionDirectory(collection)
  const relativePath = path.relative(collectionDirectory, filePath)
  const withoutExtension = relativePath.replace(/\.(md|mdx)$/i, "")

  return withoutExtension.split(path.sep).join("/")
}

function resolveUrl(collection: CollectionName, slug: string) {
  return `${collectionRoutes[collection]}/${slug}`
}

function toUtcTime(rawDate: string) {
  return new Date(`${rawDate}T00:00:00.000Z`).getTime()
}

function sortByDateDesc(left: ContentEntry, right: ContentEntry) {
  const leftTime = toUtcTime(left.date)
  const rightTime = toUtcTime(right.date)

  if (rightTime !== leftTime) {
    return rightTime - leftTime
  }

  return left.title.localeCompare(right.title)
}

function readEntry(collection: CollectionName, filePath: string): ContentEntry {
  const source = fs.readFileSync(filePath, "utf8")
  const { data, content } = matter(source)
  const frontmatter = parseFrontmatter(data, filePath)
  const slug = resolveSlug(collection, filePath)
  const rt = readingTime(content)

  return {
    ...frontmatter,
    collection,
    slug,
    url: resolveUrl(collection, slug),
    body: content,
    readingTimeText: rt.text,
    readingTimeMinutes: Math.max(1, Math.ceil(rt.minutes)),
  }
}

function readCollectionUncached(collection: CollectionName, includeDrafts: boolean): ContentEntry[] {
  const directory = resolveCollectionDirectory(collection)

  return walkContentFiles(directory)
    .map((filePath) => readEntry(collection, filePath))
    .filter((entry) => includeDrafts || !entry.draft)
    .sort(sortByDateDesc)
}

const readCollectionCached = cache((collection: CollectionName, includeDrafts: boolean) => {
  return readCollectionUncached(collection, includeDrafts)
})

function getCollectionEntries(collection: CollectionName, options?: ContentListOptions) {
  return readCollectionCached(collection, shouldIncludeDrafts(options))
}

export function getCollection(collection: CollectionName, options?: ContentListOptions) {
  return getCollectionEntries(collection, options).slice()
}

export function getCollectionSlugs(collection: CollectionName, options?: ContentListOptions) {
  return getCollectionEntries(collection, options).map((entry) => entry.slug)
}

export function getEntryBySlug(
  collection: CollectionName,
  slug: string,
  options?: ContentListOptions,
) {
  return getCollectionEntries(collection, options).find((entry) => entry.slug === slug) ?? null
}

export function getAdjacentEntries(
  collection: CollectionName,
  slug: string,
  options?: ContentListOptions,
) {
  const entries = getCollectionEntries(collection, options)
  const index = entries.findIndex((entry) => entry.slug === slug)

  if (index < 0) {
    return { previous: null, next: null }
  }

  return {
    previous: entries[index + 1] ?? null,
    next: entries[index - 1] ?? null,
  }
}

const getPublishedEntriesCached = cache((): PublishedEntry[] => {
  return collections
    .flatMap((collection) =>
      readCollectionCached(collection, false).map((entry): PublishedEntry => ({
        type: collection,
        url: entry.url,
        title: entry.title,
        description: entry.description,
        date: entry.date,
        updatedAt: entry.updatedAt,
        tags: entry.tags,
      })),
    )
    .sort((left, right) => {
      const leftTime = toUtcTime(left.date)
      const rightTime = toUtcTime(right.date)

      if (rightTime !== leftTime) {
        return rightTime - leftTime
      }

      return left.title.localeCompare(right.title)
    })
})

export function getPublishedEntries() {
  return getPublishedEntriesCached().slice()
}

export function getAllTags(options?: ContentListOptions) {
  const entries = collections.flatMap((collection) => getCollectionEntries(collection, options))
  const tags = new Set(entries.flatMap((entry) => entry.tags))

  return Array.from(tags).sort((left, right) => left.localeCompare(right))
}

export function getCollectionStats(options?: ContentListOptions) {
  return collections.map((collection) => {
    const entries = getCollectionEntries(collection, options)
    return {
      collection,
      label: collectionLabels[collection],
      description: collectionDescriptions[collection],
      href: collectionRoutes[collection],
      count: entries.length,
      latest: entries[0] ?? null,
    }
  })
}

export function formatDate(rawDate: string) {
  return utcDateFormatter.format(new Date(`${rawDate}T00:00:00.000Z`))
}
