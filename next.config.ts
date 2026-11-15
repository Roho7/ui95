import { readFileSync } from "node:fs"

import type { NextConfig } from "next"

import { LEGACY_HOSTS, SITE_URL } from "./lib/site"

const SITE_HOST = new URL(SITE_URL).host

const REGISTRY_ITEMS: { name: string; categories?: string[] }[] = JSON.parse(readFileSync(new URL("./registry.json", import.meta.url), "utf8")).items

const HARDWARE_NAMES = REGISTRY_ITEMS.filter((item) => item.categories?.includes("hardware")).map((item) => item.name)

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_SITE_URL: SITE_URL },
  async redirects() {
    const legacyHosts = LEGACY_HOSTS.filter((host) => host !== SITE_HOST).map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: `${SITE_URL}/:path*`,
      permanent: true,
    }))
    const hardwarePages = HARDWARE_NAMES.map((name) => ({ source: `/components/${name}`, destination: `/hardware/${name}`, permanent: true }))
    const ui95Pages = [
      { source: "/components", destination: "/ui", permanent: true },
      { source: "/components/:name", destination: "/ui/:name", permanent: true },
      { source: "/docs/theming", destination: "/ui/theming", permanent: true },
    ]
    return [...legacyHosts, ...hardwarePages, ...ui95Pages]
  },
  async rewrites() {
    return [
      { source: "/ui/:name.md", destination: "/md/components/:name" },
      { source: "/hardware/:name.md", destination: "/md/components/:name" },
    ]
  },
}

export default nextConfig
