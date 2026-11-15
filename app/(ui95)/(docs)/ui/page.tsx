import type { Metadata } from "next"

import { ShowcaseCatalogue } from "@/components/showcase/ShowcaseCatalogue"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Components",
  description: "Every UI95 component and variant, live on one page.",
  path: "/ui",
  type: "website",
})

export default function ComponentsPage() {
  return (
    <>
      <header className="flex flex-col gap-3">
        <h1 className="font-pixel text-[32px] leading-none uppercase md:text-[48px]">Components</h1>
        <p className="max-w-xl text-xl leading-tight">
          Every UI95 component with every variant it ships, live. Open any one in its control
          panel to change its props and copy a prompt for your agent.
        </p>
      </header>
      <ShowcaseCatalogue />
    </>
  )
}
