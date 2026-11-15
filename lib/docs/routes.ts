import { findDoc } from "./registry-docs"

export function docHref(name: string): string {
  return findDoc(name)?.library === "hardware95" ? `/hardware/${name}` : `/ui/${name}`
}
