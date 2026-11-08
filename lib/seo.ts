import type { Metadata } from "next"

import {
  absoluteUrl,
  AUTHOR_SAME_AS,
  SITE_AUTHOR,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_SAME_AS,
  SITE_URL,
  SOURCE_URL,
} from "@/lib/site"

type PageSeo = {
  title: string
  description: string
  path: string
  type?: "website" | "article"
}

export function pageMetadata({ title, description, path, type = "article" }: PageSeo): Metadata {
  const url = absoluteUrl(path)
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type, siteName: SITE_NAME },
    twitter: { card: "summary_large_image", title, description },
  }
}

type JsonLdNode = Record<string, unknown>

const ALTERNATE_NAMES = ["UI95 shadcn registry", "ui95.dev"]

const DISAMBIGUATION =
  "A shadcn/ui registry of retro React components for Radix projects, built by Roho7. Not the Preact ui95 library or other Windows 95 themes."

const AUTHOR = { "@type": "Person", name: SITE_AUTHOR.name, url: SITE_AUTHOR.url, sameAs: AUTHOR_SAME_AS }

export function websiteJsonLd(): JsonLdNode[] {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      alternateName: ALTERNATE_NAMES,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      inLanguage: "en",
      author: AUTHOR,
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareSourceCode",
      "@id": `${SITE_URL}/#software`,
      name: SITE_NAME,
      alternateName: ALTERNATE_NAMES,
      description: SITE_DESCRIPTION,
      disambiguatingDescription: DISAMBIGUATION,
      keywords: SITE_KEYWORDS.join(", "),
      url: SITE_URL,
      sameAs: SITE_SAME_AS,
      codeRepository: SOURCE_URL,
      programmingLanguage: ["TypeScript", "React"],
      runtimePlatform: "Next.js",
      license: "https://opensource.org/licenses/MIT",
      isAccessibleForFree: true,
      author: AUTHOR,
    },
  ]
}

type Crumb = { name: string; path: string }

export function articleJsonLd({
  title,
  description,
  path,
  crumbs,
  updatedAt,
}: PageSeo & { crumbs: readonly Crumb[]; updatedAt?: string }): JsonLdNode[] {
  return [
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: title,
      description,
      url: absoluteUrl(path),
      ...(updatedAt ? { dateModified: updatedAt } : {}),
      author: AUTHOR,
      publisher: AUTHOR,
      isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: SITE_NAME, url: SITE_URL },
      about: { "@type": "SoftwareSourceCode", "@id": `${SITE_URL}/#software`, name: SITE_NAME, codeRepository: SOURCE_URL },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: absoluteUrl(crumb.path),
      })),
    },
  ]
}
