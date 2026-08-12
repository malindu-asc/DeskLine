import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      // Scoped to the pure filter/search/sort helpers specifically (spec
      // §9) - not every file under utils/, several of which (getHomeRoute,
      // getCategoryIcon) aren't filter/search/sort logic at all and would
      // just dilute this number with unrelated, untested code.
      include: [
        "src/features/requests/utils/filterRequests.ts",
        "src/features/requests/utils/filterByAssignee.ts",
      ],
    },
  },
});
