// Requires Node20+ (util.styleText)
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname ?? ".", "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    // setupFiles: [] — no global setup yet; add e.g. "./vitest.setup.ts" when needed.
    coverage: {
      // Requires @vitest/coverage-v8 for `--coverage` runs; plain `vitest run` stays green without it.
      provider: "v8",
      reporter: ["text", "lcov"],
      thresholds: {
        // Ratchet up over time; initial floor only.
        lines: 60,
        functions: 50,
      },
    },
  },
});
