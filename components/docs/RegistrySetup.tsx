import { CopyCommand } from "@/components/showcase/CopyCommand"
import { REGISTRY_URL } from "@/lib/site"

function RegistrySetup() {
  return (
    <div className="flex flex-col gap-3">
      <CopyCommand command="npx shadcn@latest init -b radix" label="Radix init command" />
      <CopyCommand
        command={`npx shadcn@latest registry add "@ui95=${REGISTRY_URL}"`}
        label="registry add command"
      />
    </div>
  )
}

export { RegistrySetup }
