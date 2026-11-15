import Link from "next/link"

import { type DocPage, MANUAL_PAGES } from "@/lib/docs/pages"

function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <header>
      <h1>{title}</h1>
      <p data-part="manual-lede">{description}</p>
    </header>
  )
}

function DocSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      {children}
    </section>
  )
}

function Prose({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>
}

function Code({ children }: { children: React.ReactNode }) {
  return <code>{children}</code>
}

function Subheading({ children }: { children: React.ReactNode }) {
  return <h3>{children}</h3>
}

function CodeBlock({ title, code }: { title: string; code: string }) {
  return (
    <figure data-part="manual-code">
      <figcaption>{title}</figcaption>
      <pre>
        <code>{code}</code>
      </pre>
    </figure>
  )
}

function PageNeighbors({ href }: { href: string }) {
  const index = MANUAL_PAGES.findIndex((page) => page.href === href)
  const previous: DocPage | undefined = MANUAL_PAGES[index - 1]
  const next: DocPage | undefined = MANUAL_PAGES[index + 1]
  return (
    <nav aria-label="Pages" data-part="manual-neighbors">
      <span>{previous && <Link href={previous.href}>Previous: {previous.title}</Link>}</span>
      <span>{next && <Link href={next.href}>Next: {next.title}</Link>}</span>
    </nav>
  )
}

export { Code, CodeBlock, DocSection, PageHeader, PageNeighbors, Prose, Subheading }
