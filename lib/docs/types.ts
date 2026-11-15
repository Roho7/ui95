export type Library = "hardware95" | "ui95" | "shared"

export type DocSection = "hardware" | "components" | "blocks" | "utilities"

export type PropDoc = {
  name: string
  type: string
  required: boolean
  defaultValue: string | null
  options: string[] | null
}

export type ComponentApi = {
  name: string
  props: PropDoc[]
}

export type DocFile = {
  path: string
  source: string
}

export type RegistryDoc = {
  name: string
  title: string
  description: string
  library: Library
  section: DocSection
  notes: string | null
  dependencies: string[]
  registryDependencies: string[]
  usedBy: string[]
  sounds: string[]
  files: DocFile[]
  demoSource: string | null
  api: ComponentApi[]
  updatedAt: string | null
  hasDemo: boolean
}
