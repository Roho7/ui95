"use client"

import { usePackageManager } from "@/components/docs/use-package-manager"
import { buildAddCommand, PACKAGE_MANAGERS } from "@/lib/docs/package-managers"

import { CodeBlock } from "./parts"

function InstallCommand({ name }: { name: string }) {
  const [manager, chooseManager] = usePackageManager()
  return (
    <div data-part="manual-install">
      <div role="group" aria-label="Package manager">
        {PACKAGE_MANAGERS.map((option) => (
          <button key={option.name} type="button" aria-pressed={option.name === manager.name} onClick={() => chooseManager(option.name)}>
            {option.name}
          </button>
        ))}
      </div>
      <CodeBlock title="Terminal" code={buildAddCommand(manager, name)} />
    </div>
  )
}

export { InstallCommand }
