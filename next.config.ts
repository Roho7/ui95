import type { NextConfig } from "next"

import { LEGACY_HOSTS, SITE_URL } from "./lib/site"

const SITE_HOST = new URL(SITE_URL).host

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_SITE_URL: SITE_URL },
  async redirects() {
    return LEGACY_HOSTS.filter((host) => host !== SITE_HOST).map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: `${SITE_URL}/:path*`,
      permanent: true,
    }))
  },
  async rewrites() {
    return [{ source: "/components/:name.md", destination: "/md/components/:name" }]
  },
}

export default nextConfig
