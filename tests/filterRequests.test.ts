import { describe, expect, it } from "vitest";
import type { Request } from "../src/shared/types";
import { filterRequests } from "../src/features/requests/utils/filterRequests";

// Minimal valid Request, overridable per test - keeps each test focused on
// only the fields it actually cares about.
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

const noFilters = { search: "", status: "all", priority: "all", category: "all" };

describe("filterRequests", () => {
  it("returns every request when all filters are 'all' and search is empty", () => {
    const requests = [
      makeRequest({ id: "r1" }),
      makeRequest({ id: "r2", status: "closed", priority: "high", category: "software" }),
    ];

    expect(filterRequests(requests, noFilters)).toEqual(requests);
  });

  it("returns an empty array when given an empty array", () => {
    expect(filterRequests([], noFilters)).toEqual([]);
  });

  describe("search", () => {
    it("matches a substring anywhere in the title, not just the start", () => {
      const requests = [makeRequest({ title: "VPN disconnects on Wi-Fi" })];

      expect(filterRequests(requests, { ...noFilters, search: "disconnects" })).toHaveLength(1);
    });

    it("is case-insensitive", () => {
      const requests = [makeRequest({ title: "VPN disconnects on Wi-Fi" })];

      expect(filterRequests(requests, { ...noFilters, search: "vpn" })).toHaveLength(1);
      expect(filterRequests(requests, { ...noFilters, search: "VPN" })).toHaveLength(1);
    });

    it("excludes titles that don't contain the search term", () => {
      const requests = [makeRequest({ title: "Laptop won't boot" })];

      expect(filterRequests(requests, { ...noFilters, search: "printer" })).toEqual([]);
    });

    it("treats an empty search string as matching everything", () => {
      const requests = [makeRequest()];

      expect(filterRequests(requests, { ...noFilters, search: "" })).toEqual(requests);
    });
  });

  describe("status", () => {
    it("returns only requests matching the given status", () => {
      const open = makeRequest({ id: "r1", status: "open" });
      const closed = makeRequest({ id: "r2", status: "closed" });

      expect(filterRequests([open, closed], { ...noFilters, status: "open" })).toEqual([open]);
    });

    it("'all' bypasses the status filter", () => {
      const requests = [
        makeRequest({ id: "r1", status: "open" }),
        makeRequest({ id: "r2", status: "cancelled" }),
      ];

      expect(filterRequests(requests, { ...noFilters, status: "all" })).toEqual(requests);
    });
  });

  describe("priority", () => {
    it("returns only requests matching the given priority", () => {
      const high = makeRequest({ id: "r1", priority: "high" });
      const low = makeRequest({ id: "r2", priority: "low" });

      expect(filterRequests([high, low], { ...noFilters, priority: "high" })).toEqual([high]);
    });
  });

  describe("category", () => {
    it("returns only requests matching the given category", () => {
      const hardware = makeRequest({ id: "r1", category: "hardware" });
      const software = makeRequest({ id: "r2", category: "software" });

      expect(filterRequests([hardware, software], { ...noFilters, category: "hardware" })).toEqual([
        hardware,
      ]);
    });
  });

  describe("combined filters", () => {
    it("requires every active filter to match (AND, not OR)", () => {
      const match = makeRequest({
        id: "r1",
        title: "VPN disconnects",
        status: "open",
        priority: "high",
        category: "software",
      });
      // Same status/priority/category, but title doesn't match the search.
      const wrongTitle = makeRequest({
        id: "r2",
        title: "Printer jammed",
        status: "open",
        priority: "high",
        category: "software",
      });
      // Same title/status/category, but priority doesn't match.
      const wrongPriority = makeRequest({
        id: "r3",
        title: "VPN disconnects again",
        status: "open",
        priority: "low",
        category: "software",
      });

      const result = filterRequests([match, wrongTitle, wrongPriority], {
        search: "vpn",
        status: "open",
        priority: "high",
        category: "software",
      });

      expect(result).toEqual([match]);
    });
  });
});
