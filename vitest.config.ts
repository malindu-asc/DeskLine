import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // Scoped to tests/ on purpose. Vitest's default glob is
    // **/*.{test,spec}.?(c|m)[jt]s?(x), which also matches the Playwright
    // specs in e2e/ - Vitest would then try to execute them and die on the
    // @playwright/test import. The two runners must not see each other's files.
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/features/requests/utils/filterRequests.ts",
        "src/features/requests/utils/filterByAssignee.ts",
      ],
    },
  },
});
