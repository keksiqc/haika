import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["eslint", "typescript", "unicorn", "oxc", "import", "jsdoc", "node", "vitest"],
  categories: {
    correctness: "error",
    suspicious: "warn",
    perf: "warn",
  },
  rules: {
    "eslint/no-await-in-loop": "off",
  },
  ignorePatterns: ["**/dist", "**/.turbo"],
});
