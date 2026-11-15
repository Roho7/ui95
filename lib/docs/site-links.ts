export type SiteLink = {
  href: string
  label: string
}

export const SITE_LINKS: readonly SiteLink[] = [
  { href: "/docs", label: "Docs" },
  { href: "/ui", label: "Components" },
  { href: "/", label: "Desktop" },
  { href: "/hardware", label: "Hardware95" },
]
