// The only three deterministic requests in the system.
//
// src/mocks/db.ts seeds 503 requests: these three hand-written fixtures plus
// 500 from generateRequests(), which randomises status, priority, category and
// assignee with Math.random() and generates ids with crypto.randomUUID(). The
// generated 500 therefore differ on every page load and no assertion may
// depend on any of them.

export const FIXTURE_REQUESTS = {
  /**
   * The preferred anchor for deterministic tests.
   *
   * Also the only fixture whose title is unique as a substring: filterRequests
   * matches on title.includes(search), and the generator's title pool contains
   * the literal strings "VPN disconnects frequently" and "Office air
   * conditioner not working" (suffixed "#N"), so searching either matches
   * dozens of generated rows. The pool's closest hardware entry is "Laptop
   * won't turn on", not "Laptop won't boot".
   */
  r1: {
    id: "r1",
    title: "Laptop won't boot",
    status: "open",
    priority: "high",
    category: "hardware",
    requesterId: "u1",
    assigneeId: null,
  },
  r2: {
    id: "r2",
    title: "VPN disconnects frequently",
    status: "pending",
    priority: "medium",
    category: "software",
    requesterId: "u1",
    assigneeId: "u2",
  },
  r3: {
    id: "r3",
    title: "Office air conditioner not working",
    status: "closed",
    priority: "high",
    category: "facilities",
    requesterId: "u1",
    assigneeId: "u3",
  },
} as const;

/** Rendered by getUserName() when a request has no assignee. */
export const UNASSIGNED_LABEL = "Unassigned";
