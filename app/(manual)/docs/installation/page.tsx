import type { Metadata } from "next"
import Link from "next/link"

import { InstallCommand } from "@/components/chrome/manual/InstallCommand"
import { Code, CodeBlock, DocSection, PageHeader, PageNeighbors, Prose } from "@/components/chrome/manual/parts"
import { JsonLd } from "@/components/docs/JsonLd"
import { PACKAGE_MANAGERS } from "@/lib/docs/package-managers"
import { GUIDE } from "@/lib/docs/pages"
import { articleJsonLd, pageMetadata } from "@/lib/seo"
import { REGISTRY_URL } from "@/lib/site"

const PAGE = GUIDE.installation

export const metadata: Metadata = pageMetadata({ title: PAGE.title, description: PAGE.description, path: PAGE.href })

const REGISTRIES_SNIPPET = JSON.stringify({ registries: { "@ui95": REGISTRY_URL } }, null, 2)

export default function InstallationPage() {
  return (
    <>
      <JsonLd
        data={articleJsonLd({
          title: PAGE.title,
          description: PAGE.description,
          path: PAGE.href,
          crumbs: [
            { name: "Manual", path: "/docs" },
            { name: PAGE.title, path: PAGE.href },
          ],
        })}
      />
      <PageHeader title={PAGE.title} description={PAGE.description} />
      <DocSection id="namespace" title="2.1 Register the namespace">
        <Prose>
          Both libraries install from one shadcn registry. Register its namespace once, then add anything by name. The CLI
          fills <Code>{"{style}"}</Code> from your <Code>components.json</Code>.
        </Prose>
        <CodeBlock title="Terminal" code={`npx shadcn@latest registry add "@ui95=${REGISTRY_URL}"`} />
        <Prose>That writes this to components.json. You can also paste it yourself.</Prose>
        <CodeBlock title="components.json" code={REGISTRIES_SNIPPET} />
      </DocSection>
      <DocSection id="ui95" title="2.2 UI95, the software">
        <Prose>
          UI95 components need a React project with Tailwind CSS 4 and shadcn on Radix. Base UI projects are not supported
          yet. Start one if you have none.
        </Prose>
        <CodeBlock title="Terminal" code="npx shadcn@latest init -b radix" />
        <Prose>
          Every UI95 component reads the theme tokens, so add the theme first. The <Link href={GUIDE.theming.href}>theming guide</Link>{" "}
          covers fonts and palettes.
        </Prose>
        <InstallCommand name="theme" />
        <Prose>
          Then add components. Each one brings every item it builds on. No icon pack ships with the theme;{" "}
          <a href="https://github.com/gitntg/pixelarticons-react">pixelarticons-react</a> sits on the same pixel grid.
        </Prose>
        <InstallCommand name="button" />
      </DocSection>
      <DocSection id="hardware95" title="2.3 Hardware95, the machine">
        <Prose>
          Hardware95 parts work in any shadcn project, with or without UI95. They style themselves under{" "}
          <Code>[data-hw]</Code> and never touch your theme. Start with the foundation, then add parts from the{" "}
          <Link href="/hardware">parts catalogue</Link>.
        </Prose>
        <InstallCommand name="hardware" />
        <InstallCommand name="rotary-knob" />
      </DocSection>
      <DocSection id="sound" title="2.4 Sound">
        <Prose>
          Sound is optional and shared by both libraries. Chapter 3, <Link href={GUIDE.sound.href}>Sound</Link>, covers it.
        </Prose>
      </DocSection>
      <DocSection id="package-managers" title="2.5 Package managers">
        <table data-part="manual-table">
          <thead>
            <tr>
              <th scope="col">Manager</th>
              <th scope="col">Run the CLI</th>
              <th scope="col">Install a dependency</th>
            </tr>
          </thead>
          <tbody>
            {PACKAGE_MANAGERS.map((manager) => (
              <tr key={manager.name}>
                <td>
                  <Code>{manager.name}</Code>
                </td>
                <td>
                  <Code>{manager.runner}</Code>
                </td>
                <td>
                  <Code>{manager.install}</Code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DocSection>
      <PageNeighbors href={PAGE.href} />
    </>
  )
}
