// The only deterministic requests in the system. The other 500 are generated
// with Math.random() and crypto.randomUUID() on every page load, so nothing may
// depend on them.

export const FIXTURE_REQUESTS = {
  /**
   * The preferred anchor. Also the only fixture whose title is unique as a
   * substring - the generator's pool contains "VPN disconnects frequently" and
   * "Office air conditioner not working", but its hardware entry is "Laptop
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

/** Shown when a request has no assignee. */
export const UNASSIGNED_LABEL = "Unassigned";
