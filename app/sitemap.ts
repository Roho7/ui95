import { execFileSync } from "node:child_process"

import type { MetadataRoute } from "next"

import { GUIDE_PAGES } from "@/lib/docs/pages"
import { REGISTRY_DOCS } from "@/lib/docs/registry-docs"
import { docHref } from "@/lib/docs/routes"
import { absoluteUrl } from "@/lib/site"

const REGISTRY_DATES = REGISTRY_DOCS.flatMap((doc) => (doc.updatedAt ? [doc.updatedAt] : []))

const LATEST_REGISTRY_DATE = REGISTRY_DATES.reduce<string | undefined>(
  (latest, date) => (latest === undefined || date > latest ? date : latest),
  undefined
)

function lastCommitDate(paths: readonly string[]): string | undefined {
  try {
    const date = execFileSync("git", ["log", "-1", "--format=%cs", "--", ...paths], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim()
    return date === "" ? undefined : date
  } catch {
    return undefined
  }
}

function guideDate(href: string): string | undefined {
  return lastCommitDate([`app/(ui95)/(docs)${href}/page.tsx`]) ?? LATEST_REGISTRY_DATE
}

export default function sitemap(): MetadataRoute.Sitemap {
  const home = lastCommitDate(["app/page.tsx", "app/_demo"]) ?? LATEST_REGISTRY_DATE
  return [
    { url: absoluteUrl("/"), lastModified: home, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/components"), lastModified: LATEST_REGISTRY_DATE, changeFrequency: "weekly", priority: 0.9 },
    ...GUIDE_PAGES.map((page) => ({
      url: absoluteUrl(page.href),
      lastModified: guideDate(page.href),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...REGISTRY_DOCS.map((doc) => ({
      url: absoluteUrl(docHref(doc.name)),
      lastModified: doc.updatedAt ?? LATEST_REGISTRY_DATE,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ]
}
