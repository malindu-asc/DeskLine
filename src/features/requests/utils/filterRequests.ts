import type { Request } from "../../../shared/types";

interface FilterOptions {
  search: string;
  status: string;
  priority: string;
  category: string;
}

export function filterRequests(
  requests: Request[],
  filters: FilterOptions
) {
  return requests.filter((request) => {
    const matchesSearch =
      request.title
        .toLowerCase()
        .includes(filters.search.toLowerCase());

    const matchesStatus =
      filters.status === "all" ||
      request.status === filters.status;

    const matchesPriority =
      filters.priority === "all" ||
      request.priority === filters.priority;

    const matchesCategory =
      filters.category === "all" ||
      request.category === filters.category;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesCategory
    );
  });
}