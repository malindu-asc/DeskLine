/**
 * Test data builders.
 *
 * Titles must be unique per run. src/mocks/db.ts seeds 500 generated requests
 * whose titles are drawn from a fixed pool, and filterRequests matches on
 * title.includes(search) - so a fixed test title risks colliding with generated
 * rows, and a title reused across parallel workers risks colliding with itself.
 */

import type { NewRequestInput } from "../pages/NewRequestPage";

/** e.g. "E2E ticket 1790578199123-k3f9a" */
export function uniqueTitle(prefix = "E2E ticket"): string {
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${prefix} ${Date.now()}-${suffix}`;
}

/**
 * A valid new-request payload. The description must be at least 10 characters
 * and the title at least 3, or NewRequestPage keeps the submit button disabled.
 */
export function aNewRequest(overrides: Partial<NewRequestInput> = {}): NewRequestInput {
  return {
    title: uniqueTitle(),
    description: "Raised by the end-to-end suite to exercise the full lifecycle.",
    category: "hardware",
    priority: "high",
    ...overrides,
  };
}
