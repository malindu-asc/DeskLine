import { defineConfig, devices } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

export default defineConfig({
  testDir: "./e2e",

  // Safe because the MSW db re-seeds on every full page load (src/mocks/db.ts
  // is module-scoped), so no two workers can observe each other's writes.
  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  // Deliberately zero. A spec that only passes on a retry is a spec to fix -
  // the bar for this assignment is a clean live run, not an eventually-green one.
  retries: 0,

  // The Queue and My Requests pages render all 503 seeded requests with no
  // virtualisation - roughly 13,500 DOM nodes, about 3s to paint on an idle
  // machine. Playwright's 5s default is not enough once several workers are
  // painting that at the same time, and a too-tight timeout shows up as a
  // confusing "element(s) not found" rather than a slow-render message.
  expect: { timeout: 15_000 },

  // The cross-role lifecycle flow signs in and out four times, and each list
  // screen paints those 13,500 nodes again. It lands around 26s on an idle
  // machine, which leaves no headroom under Playwright's 30s default.
  timeout: 90_000,

  // Capped deliberately. Above roughly 4, the workers contend for CPU rendering
  // those 13,500-node pages and every test gets slower, so more parallelism
  // makes the suite worse rather than better.
  workers: process.env.CI ? 2 : 4,

  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    // --strictPort matters: without it Vite silently falls back to 5174 when
    // 5173 is taken, and every test then runs against a stale baseURL.
    command: "npm run dev -- --port 5173 --strictPort",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
