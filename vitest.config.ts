import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
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
