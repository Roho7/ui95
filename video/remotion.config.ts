import path from "node:path"

import { Config } from "@remotion/cli/config"
import { enableTailwind } from "@remotion/tailwind-v4"
import { rspack } from "@rspack/core"

const repoRoot = path.resolve(process.cwd(), "..")
const ownModules = path.resolve(process.cwd(), "node_modules")
const shims = path.resolve(process.cwd(), "src", "shims")

Config.setRspack(true)
Config.setVideoImageFormat("jpeg")
Config.setOverwriteOutput(true)
Config.setDefaultPremountInSeconds(1)
Config.setChromiumOpenGlRenderer("angle")
Config.setChromeMode("chrome-for-testing")

Config.overrideBundlerConfig((current) => {
  const withTailwind = enableTailwind(current)
  return {
    ...withTailwind,
    module: {
      ...withTailwind.module,
      rules: [...(withTailwind.module?.rules ?? []), { test: /\.m?js$/, resolve: { fullySpecified: false } }],
    },
    plugins: [
      ...(withTailwind.plugins ?? []),
      new rspack.DefinePlugin({
        "process.env.NEXT_PUBLIC_SITE_URL": JSON.stringify("https://www.ui95.dev"),
        "process.env.VERCEL_PROJECT_PRODUCTION_URL": JSON.stringify("www.ui95.dev"),
      }),
    ],
    resolve: {
      ...withTailwind.resolve,
      alias: {
        ...(withTailwind.resolve?.alias as Record<string, string>),
        "@": repoRoot,
        "next/link": path.join(shims, "next-link.tsx"),
        "next/navigation": path.join(shims, "next-navigation.ts"),
        "next/image": path.join(shims, "next-image.tsx"),
        react: path.join(ownModules, "react"),
        "react-dom": path.join(ownModules, "react-dom"),
        remotion: path.join(ownModules, "remotion"),
      },
    },
  }
})
