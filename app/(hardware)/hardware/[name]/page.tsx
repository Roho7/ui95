import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Bench } from "@/components/chrome/hardware/Bench"
import { InstallReadout } from "@/components/chrome/hardware/controls"
import { JsonLd } from "@/components/docs/JsonLd"
import { Legend } from "@/components/hardware/faceplate"
import { markdownUrl } from "@/lib/docs/llms"
import { findDoc, HARDWARE_DOCS } from "@/lib/docs/registry-docs"
import { docHref } from "@/lib/docs/routes"
import type { RegistryDoc } from "@/lib/docs/types"
import { articleJsonLd, pageMetadata } from "@/lib/seo"

type PartPageProps = {
  params: Promise<{ name: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return HARDWARE_DOCS.map((doc) => ({ name: doc.name }))
}

function readPart(name: string): { doc: RegistryDoc; model: string } | null {
  const index = HARDWARE_DOCS.findIndex((doc) => doc.name === name)
  return index === -1 ? null : { doc: HARDWARE_DOCS[index], model: `HW-${index + 1}` }
}

export async function generateMetadata({ params }: PartPageProps): Promise<Metadata> {
  const part = readPart((await params).name)
  if (!part) {
    return {}
  }
  const metadata = pageMetadata({ title: part.doc.title, description: part.doc.description, path: docHref(part.doc.name) })
  return { ...metadata, alternates: { ...metadata.alternates, types: { "text/markdown": markdownUrl(part.doc.name) } } }
}

function PartLinks({ names }: { names: readonly string[] }) {
  return (
    <p>
      {names.map((name, index) => (
        <span key={name}>
          {index > 0 && " · "}
          <Link href={docHref(name)}>{findDoc(name)?.title ?? name}</Link>
        </span>
      ))}
    </p>
  )
}

function SpecSheet({ doc }: { doc: RegistryDoc }) {
  return (
    <section aria-labelledby="spec">
      <h2 id="spec">Spec sheet</h2>
      {doc.api.map((component) => (
        <table key={component.name} data-part="hw-spec">
          <caption>{component.name}</caption>
          <thead>
            <tr>
              <th scope="col">Prop</th>
              <th scope="col">Type</th>
              <th scope="col">Default</th>
            </tr>
          </thead>
          <tbody>
            {component.props.length === 0 ? (
              <tr>
                <td colSpan={3}>No props of its own. It forwards the props of the element it wraps.</td>
              </tr>
            ) : (
              component.props.map((prop) => (
                <tr key={prop.name}>
                  <td>
                    <code>
                      {prop.name}
                      {prop.required ? "" : "?"}
                    </code>
                  </td>
                  <td>
                    <code>{prop.type}</code>
                  </td>
                  <td>
                    <code>{prop.defaultValue ?? "none"}</code>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      ))}
    </section>
  )
}

export default async function HardwarePartPage({ params }: PartPageProps) {
  const part = readPart((await params).name)
  if (!part) {
    notFound()
  }
  const { doc, model } = part
  const href = docHref(doc.name)

  return (
    <>
      <JsonLd
        data={articleJsonLd({
          title: doc.title,
          description: doc.description,
          path: href,
          updatedAt: doc.updatedAt ?? undefined,
          crumbs: [
            { name: "Hardware95", path: "/hardware" },
            { name: doc.title, path: href },
          ],
        })}
      />
      <header data-part="hw-heading">
        <div data-part="hw-badge-row">
          <Legend size="sm">
            <Link href="/hardware">Hardware95</Link> · Parts
          </Legend>
          <Legend size="sm">Model {model}</Legend>
        </div>
        <h1>{doc.title}</h1>
        <p>{doc.description}</p>
      </header>
      <Bench name={doc.name} />
      <section aria-labelledby="install">
        <h2 id="install">Install</h2>
        <InstallReadout name={doc.name} />
      </section>
      {doc.notes && (
        <section aria-labelledby="notes">
          <h2 id="notes">Notes</h2>
          <p>{doc.notes}</p>
        </section>
      )}
      <SpecSheet doc={doc} />
      {doc.sounds.length > 0 && (
        <section aria-labelledby="sounds">
          <h2 id="sounds">Sounds</h2>
          <p>
            {doc.sounds.map((key) => (
              <code key={key}>{key} </code>
            ))}
          </p>
        </section>
      )}
      {doc.registryDependencies.length > 0 && (
        <section aria-labelledby="uses">
          <h2 id="uses">Uses</h2>
          <PartLinks names={doc.registryDependencies} />
        </section>
      )}
      {doc.usedBy.length > 0 && (
        <section aria-labelledby="used-by">
          <h2 id="used-by">Used by</h2>
          <PartLinks names={doc.usedBy} />
        </section>
      )}
      <section aria-labelledby="source">
        <h2 id="source">Source</h2>
        {doc.files.map((file) => (
          <details key={file.path} data-part="hw-source">
            <summary>{file.path}</summary>
            <pre data-part="hw-well">
              <code>{file.source}</code>
            </pre>
          </details>
        ))}
      </section>
    </>
  )
}
