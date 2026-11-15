"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import type { DocPage } from "@/lib/docs/pages"

function ManualContents({ pages }: { pages: readonly DocPage[] }) {
  const path = usePathname()
  return (
    <nav aria-label="Contents" data-part="manual-contents">
      Contents
      <ol>
        {pages.map((page, index) => (
          <li key={page.href}>
            <Link href={page.href} aria-current={path === page.href ? "page" : undefined}>
              {index + 1}. {page.title}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export { ManualContents }
