import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"

const ROOT = new URL("..", import.meta.url).pathname
const REGISTRY = JSON.parse(readFileSync(join(ROOT, "registry.json"), "utf8"))
const COMPONENT_DIRS = ["components/ui", "components/retro", "components/hardware"]
const HARDWARE_DIR = "components/hardware/"
const LIBRARY_CATEGORIES = ["hardware", "ui", "shared"]
const HARDWARE_FOUNDATION = "@ui95/hardware"
const DEMOS_DIR = "components/showcase/demos/"
const SOURCE_DIRS = ["app", "components", "hooks", "lib", "scripts"]
const SOURCE_EXTENSIONS = [".ts", ".tsx", ".mjs"]
const PLATFORM_PACKAGES = new Set(["react", "react-dom", "next"])

const CLASS_RULES = [
  {
    id: "no-rounded-corners",
    pattern: /\brounded(?!-none\b)(-[a-z0-9]+)?\b/g,
    why: "corners are square; the 1-bit look has no radius",
  },
  {
    id: "no-smooth-motion",
    pattern: /\b(transition(-[a-z]+)?|duration-\d+|ease-(in|out|in-out|linear)|animate-(in|out|spin|pulse|bounce|ping))\b|\b(fade|zoom|slide)-(in|out)\b/g,
    why: "motion is stepped at a low frame rate; use steps() or a stepped timer, never tweened transitions",
  },
  {
    id: "no-alpha-colors",
    pattern: /\b(bg|text|border|ring|fill|stroke|outline|from|to|via|decoration|divide|placeholder)-[a-z0-9-]+\/\d+\b|\bopacity-\d+\b/g,
    why: "colors are the four inks; shades come from dither-25/50/75, never alpha",
  },
  {
    id: "no-soft-effects",
    pattern: /\bshadow-(xs|sm|md|lg|xl|2xl|inner)\b|\b(backdrop-)?blur(-[a-z0-9]+)?\b|\bbg-(gradient|linear|radial|conic)-[a-z-]+\b|\bdrop-shadow(-[a-z0-9]+)?\b/g,
    why: "edges are hard: offset-shadow-*, bevel-raised/sunken or pixel-border instead",
  },
  {
    id: "no-off-system-fonts",
    pattern: /\bfont-(sans|serif)\b/g,
    why: "type is font-pixel for labels and titles, font-mono for body",
  },
  {
    id: "no-raw-border-widths",
    pattern: /\bborder(-[xytblr])?-(2|4|8)\b/g,
    why: "borders are --pixel multiples: pixel-border or border-(length:--pixel)",
  },
  {
    id: "no-literal-colors",
    pattern: /#[0-9a-fA-F]{3,8}\b(?![-\w])|\b(rgb|rgba|hsl|hsla|oklch|oklab)\(/g,
    why: "colors come from tokens (--ink-*, shadcn tokens, --keycap-*), never literals",
  },
  {
    id: "no-framer-or-gsap",
    pattern: /from\s+["'](framer-motion|motion\/react|gsap|react-spring)["']/g,
    why: "animations are stepped CSS or the shader mount's stepped clock",
  },
]

const ARROW_DIRS = ["app/", "components/", "lib/"]
const ARROW_PATTERN = /[\u2190-\u21FF\u2794-\u27BF\u27F0-\u27FF\u2900-\u297F\u00AB\u00BB]|->/g

function findArrowViolations(path, text) {
  if (!ARROW_DIRS.some((directory) => path.startsWith(directory)) || !/\.tsx?$/.test(path)) {
    return []
  }
  const violations = []
  text.split("\n").forEach((line, index) => {
    for (const match of line.matchAll(ARROW_PATTERN)) {
      violations.push({ path, line: index + 1, rule: "no-text-arrows", found: match[0], why: "labels, links, buttons and headings use the plain label; signal direction with an icon component or the part's own affordance" })
    }
  })
  return violations
}

const COMMENT_PATTERN = /(^|[^:"'`\\])\/\/(?!\/?\s*<reference)|\/\*|\{\s*\/\*/

function listFiles(directory) {
  if (!existsSync(directory)) {
    return []
  }
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name)
    return statSync(path).isDirectory() ? listFiles(path) : [path]
  })
}

function isSourceFile(path) {
  return SOURCE_EXTENSIONS.some((extension) => path.endsWith(extension)) && !path.endsWith(".generated.ts")
}

function stripStrings(line) {
  return line.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/g, '""')
}

function findClassViolations(path, text) {
  const violations = []
  text.split("\n").forEach((line, index) => {
    for (const rule of CLASS_RULES) {
      for (const match of line.matchAll(rule.pattern)) {
        violations.push({ path, line: index + 1, rule: rule.id, found: match[0], why: rule.why })
      }
    }
  })
  return violations
}

function findComments(path, text) {
  const violations = []
  let isInTemplate = false
  text.split("\n").forEach((line, index) => {
    const backticks = (line.match(/`/g) ?? []).length
    const code = isInTemplate ? "" : stripStrings(line)
    if (backticks % 2 === 1) {
      isInTemplate = !isInTemplate
    }
    if (COMMENT_PATTERN.test(code) || (isInTemplate && /^\s*\/\//.test(line))) {
      violations.push({ path, line: index + 1, rule: "no-comments", found: line.trim().slice(0, 60), why: "the codebase carries no comments at all, GLSL included" })
    }
  })
  return violations
}

function listImports(text) {
  return [...text.matchAll(/from\s+["']([^"']+)["']/g)].map((match) => match[1])
}

function readPackageName(specifier) {
  const parts = specifier.split("/")
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]
}

function findRegistryViolations() {
  const violations = []
  const itemByFile = new Map()
  for (const item of REGISTRY.items) {
    for (const file of item.files ?? []) {
      itemByFile.set(file.path, item.name)
      if (file.target?.startsWith("~/")) {
        itemByFile.set(file.target.slice(2), item.name)
      }
      if (!existsSync(join(ROOT, file.path))) {
        violations.push({ path: "registry.json", line: 0, rule: "registry-file-exists", found: `${item.name}: ${file.path}`, why: "every registry file must exist" })
      }
    }
  }
  for (const directory of COMPONENT_DIRS) {
    for (const path of listFiles(join(ROOT, directory)).filter(isSourceFile)) {
      const file = relative(ROOT, path)
      if (!itemByFile.has(file)) {
        violations.push({ path: file, line: 0, rule: "registry-covers-component", found: file, why: "every component file ships in a registry item; add it to registry.json" })
      }
    }
  }
  for (const item of REGISTRY.items) {
    const declared = new Set(item.registryDependencies ?? [])
    const npmDeclared = new Set(item.dependencies ?? [])
    const libraries = (item.categories ?? []).filter((category) => LIBRARY_CATEGORIES.includes(category))
    if (libraries.length !== 1) {
      violations.push({ path: "registry.json", line: 0, rule: "registry-one-library", found: `${item.name}: ${libraries.join(", ") || "none"}`, why: `every item belongs to exactly one library category: ${LIBRARY_CATEGORIES.join(", ")}` })
    }
    if (libraries[0] === "shared" && declared.has("@ui95/theme")) {
      violations.push({ path: "registry.json", line: 0, rule: "shared-skips-theme", found: item.name, why: "shared items serve both libraries, so they cannot pull in the UI95 theme" })
    }
    const isHardware = libraries[0] === "hardware"
    if (isHardware) {
      if (declared.has("@ui95/theme")) {
        violations.push({ path: "registry.json", line: 0, rule: "hardware-skips-theme", found: item.name, why: "Hardware95 parts carry scoped tokens and must not restyle the host app" })
      }
      if (item.name !== "hardware" && !declared.has(HARDWARE_FOUNDATION)) {
        violations.push({ path: "registry.json", line: 0, rule: "hardware-depends-on-foundation", found: item.name, why: `every Hardware95 part needs ${HARDWARE_FOUNDATION} for its tokens` })
      }
      if (npmDeclared.has("radix-ui")) {
        violations.push({ path: "registry.json", line: 0, rule: "hardware-skips-radix", found: item.name, why: "Hardware95 parts serve every shadcn base, so they import no radix-ui" })
      }
    } else if ((item.type === "registry:ui" || item.type === "registry:block") && !declared.has("@ui95/theme")) {
      violations.push({ path: "registry.json", line: 0, rule: "registry-depends-on-theme", found: item.name, why: "every component needs the theme tokens and utilities" })
    }
    for (const file of item.files ?? []) {
      const filePath = join(ROOT, file.path)
      if (!existsSync(filePath)) {
        continue
      }
      for (const specifier of listImports(readFileSync(filePath, "utf8"))) {
        if (specifier.startsWith("@/")) {
          const target = ["", ".tsx", ".ts", "/index.ts"].map((extension) => `${specifier.slice(2)}${extension}`).find((candidate) => itemByFile.has(candidate))
          const owner = target ? itemByFile.get(target) : undefined
          if (owner === undefined) {
            if (specifier !== "@/lib/utils") {
              violations.push({ path: file.path, line: 0, rule: "registry-import-shipped", found: specifier, why: "an imported local file must ship in some registry item" })
            }
            continue
          }
          if (owner !== item.name && !declared.has(`@ui95/${owner}`)) {
            violations.push({ path: file.path, line: 0, rule: "registry-declares-import", found: `${item.name} imports ${specifier} but does not list @ui95/${owner}`, why: "an install would miss that file" })
          }
          continue
        }
        if (specifier.startsWith(".") || specifier.startsWith("node:")) {
          continue
        }
        const packageName = readPackageName(specifier)
        if (!PLATFORM_PACKAGES.has(packageName) && !npmDeclared.has(packageName)) {
          violations.push({ path: file.path, line: 0, rule: "registry-declares-package", found: `${item.name} imports ${packageName}`, why: "list it in the item's dependencies so the CLI installs it" })
        }
      }
    }
  }
  return violations
}

function findRoadmapViolations() {
  const roadmapPath = join(ROOT, "ROADMAP.md")
  if (!existsSync(roadmapPath)) {
    return []
  }
  const shipped = new Set(REGISTRY.items.filter((item) => item.type === "registry:ui" || item.type === "registry:block").map((item) => item.name))
  const violations = []
  readFileSync(roadmapPath, "utf8").split("\n").forEach((line, index) => {
    const entry = line.match(/^- \[( |x)\] ([a-z0-9-]+)/)
    if (entry === null) {
      return
    }
    const [, mark, name] = entry
    if (mark === "x" && !shipped.has(name)) {
      violations.push({ path: "ROADMAP.md", line: index + 1, rule: "roadmap-matches-registry", found: name, why: "ticked but not a registry:ui or registry:block item" })
    }
    if (mark === " " && shipped.has(name)) {
      violations.push({ path: "ROADMAP.md", line: index + 1, rule: "roadmap-matches-registry", found: name, why: "shipped in registry.json but not ticked" })
    }
  })
  return violations
}

function isHardwareFile(file) {
  if (file.startsWith(HARDWARE_DIR)) {
    return true
  }
  const demo = file.startsWith(DEMOS_DIR) ? file.slice(DEMOS_DIR.length).replace(/\.tsx$/, "") : null
  return REGISTRY.items.some((item) => item.name === demo && item.categories?.includes("hardware"))
}

const ROOT_LAYOUT = "app/layout.tsx"
const ROOT_LAYOUT_IMPORTS = new Set(["./globals.css", "next", "next/font/google", "@/components/theme-provider", "@/components/ui/ui95-sounds", "@/lib/brand/keycap", "@/lib/site", "@/lib/utils", "./_site/crt", "./_site/palettes"])

function findRootLayoutViolations() {
  const text = readFileSync(join(ROOT, ROOT_LAYOUT), "utf8")
  const specifiers = [...text.matchAll(/^import\s+(?:[^"']*\s+from\s+)?["']([^"']+)["']/gm)].map((match) => match[1])
  return specifiers
    .filter((specifier) => !ROOT_LAYOUT_IMPORTS.has(specifier))
    .map((specifier) => ({ path: ROOT_LAYOUT, line: 0, rule: "root-layout-stays-bare", found: specifier, why: "the root layout serves Hardware95 and UI95 alike; chrome and anything that paints belongs in a route group layout" }))
}

function checkStyle() {
  const violations = []
  for (const directory of SOURCE_DIRS) {
    for (const path of listFiles(join(ROOT, directory)).filter(isSourceFile)) {
      const text = readFileSync(path, "utf8")
      const file = relative(ROOT, path)
      violations.push(...findComments(file, text))
      violations.push(...findArrowViolations(file, text))
      if ((file.startsWith("components/") || file.startsWith("app/")) && !isHardwareFile(file)) {
        violations.push(...findClassViolations(file, text))
      }
    }
  }
  violations.push(...findRegistryViolations())
  violations.push(...findRoadmapViolations())
  violations.push(...findRootLayoutViolations())
  return violations
}

const violations = checkStyle()
if (violations.length > 0) {
  for (const violation of violations) {
    const location = violation.line > 0 ? `${violation.path}:${violation.line}` : violation.path
    console.error(`${location}  [${violation.rule}]  ${violation.found}\n    ${violation.why}`)
  }
  console.error(`\ncheck-style: ${violations.length} violation(s)`)
  process.exit(1)
}
console.log("check-style: clean")
