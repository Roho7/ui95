import { config } from "@remotion/eslint-config-flat"
import simpleImportSort from "eslint-plugin-simple-import-sort"
import unusedImports from "eslint-plugin-unused-imports"

export default [
  ...config,
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "unused-imports/no-unused-imports": "error",
    },
  },
]
