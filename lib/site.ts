const PRODUCTION_HOST = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "www.ui95.dev"

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${PRODUCTION_HOST}`

export const SITE_NAME = "UI95"

export const SOURCE_URL = "https://github.com/Roho7/ui95"

export const SITE_TAGLINE = "Retro components for shadcn."

export const SITE_DESCRIPTION =
  "UI95 is a shadcn registry of retro, Windows 95 style React components: square corners, four inks, stepped motion, ordered dither and synthesized click sounds. Install them with the shadcn CLI and own the code."

export const SITE_KEYWORDS = [
  "shadcn",
  "shadcn registry",
  "retro UI",
  "Windows 95 UI",
  "pixel art components",
  "1-bit design",
  "dither",
  "React components",
  "Tailwind CSS",
  "Radix UI",
  "Next.js",
]

export const SITE_AUTHOR = { name: "Roho7", url: "https://roho.live" }

export const SITE_TWITTER = "@Rohosen_"

export const LEGACY_HOSTS = ["nostalgui.vercel.app"]

export const SITE_SAME_AS = [SOURCE_URL]

export const AUTHOR_SAME_AS = [SITE_AUTHOR.url, "https://github.com/Roho7", `https://x.com/${SITE_TWITTER.slice(1)}`]

export const REGISTRY_URL = `${SITE_URL}/r/{style}/{name}.json`

export function registryItemUrl(name: string): string {
  return `${SITE_URL}/r/${name}.json`
}

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`
}
