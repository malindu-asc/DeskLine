// Titles must be unique per run: the app seeds 500 generated requests from a
// fixed title pool and filters with title.includes(search), so a fixed title
// risks matching rows the test did not create.

import type { NewRequestInput } from "../pages/NewRequestPage";

export function uniqueTitle(prefix = "E2E ticket"): string {
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${prefix} ${Date.now()}-${suffix}`;
}

/** Title needs 3+ characters and description 10+, or submit stays disabled. */
export function aNewRequest(overrides: Partial<NewRequestInput> = {}): NewRequestInput {
  return {
    title: uniqueTitle(),
    description: "Raised by the end-to-end suite to exercise the full lifecycle.",
    category: "hardware",
    priority: "high",
    ...overrides,
  };
}

/** Comment bodies used by the flows. */
export const COMMENTS = {
  technician: "Picked this up - investigating the boot failure now.",
  requester: "Still happening after a full power cycle this morning.",
};
