import { describe, expect, it } from "vitest";
import type { Request } from "../src/shared/types";
import { filterByAssignee } from "../src/features/requests/utils/filterByAssignee";

function makeRequest(overrides: Partial<Request> = {}): Request {
  return {
    id: "r1",
    title: "Laptop won't boot",
    status: "open",
    priority: "medium",
    category: "hardware",
    requesterId: "u1",
    assigneeId: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

const CURRENT_USER_ID = "u2";

describe("filterByAssignee", () => {
  it("'all' returns every request unchanged, regardless of assignee", () => {
    const requests = [
      makeRequest({ id: "r1", assigneeId: null }),
      makeRequest({ id: "r2", assigneeId: CURRENT_USER_ID }),
      makeRequest({ id: "r3", assigneeId: "someone-else" }),
    ];

    expect(filterByAssignee(requests, "all", CURRENT_USER_ID)).toEqual(requests);
  });

  it("'unassigned' returns only requests with assigneeId === null", () => {
    const unassigned = makeRequest({ id: "r1", assigneeId: null });
    const assigned = makeRequest({ id: "r2", assigneeId: CURRENT_USER_ID });

    expect(filterByAssignee([unassigned, assigned], "unassigned", CURRENT_USER_ID)).toEqual([
      unassigned,
    ]);
  });

  it("'unassigned' returns an empty array when nothing is unassigned", () => {
    const requests = [makeRequest({ assigneeId: CURRENT_USER_ID })];

    expect(filterByAssignee(requests, "unassigned", CURRENT_USER_ID)).toEqual([]);
  });

  it("'me' returns only requests assigned to the given current user", () => {
    const mine = makeRequest({ id: "r1", assigneeId: CURRENT_USER_ID });
    const someoneElses = makeRequest({ id: "r2", assigneeId: "other-staff" });
    const unassigned = makeRequest({ id: "r3", assigneeId: null });

    expect(filterByAssignee([mine, someoneElses, unassigned], "me", CURRENT_USER_ID)).toEqual([
      mine,
    ]);
  });

  it("'me' returns an empty array when nothing is assigned to the current user", () => {
    const requests = [makeRequest({ assigneeId: "other-staff" })];

    expect(filterByAssignee(requests, "me", CURRENT_USER_ID)).toEqual([]);
  });

  it("returns an empty array when given an empty array, for every mode", () => {
    expect(filterByAssignee([], "all", CURRENT_USER_ID)).toEqual([]);
    expect(filterByAssignee([], "unassigned", CURRENT_USER_ID)).toEqual([]);
    expect(filterByAssignee([], "me", CURRENT_USER_ID)).toEqual([]);
  });
});
