import { useSearchParams } from "react-router-dom";

import type { Request } from "../../../shared/types";
import { filterRequests } from "../utils/filterRequests";

export function useRequestFilters(requests: Request[]) {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "all";
  const priority = searchParams.get("priority") ?? "all";
  const category = searchParams.get("category") ?? "all";

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);

    if (value === "all" || value === "") {
      next.delete(key);
    } else {
      next.set(key, value);
    }

    setSearchParams(next);
  }

  const filteredRequests = filterRequests(requests, {
    search,
    status,
    priority,
    category,
  });

  return {
    search,
    status,
    priority,
    category,
    setSearch: (value: string) => updateParam("search", value),
    setStatus: (value: string) => updateParam("status", value),
    setPriority: (value: string) => updateParam("priority", value),
    setCategory: (value: string) => updateParam("category", value),
    filteredRequests,
  };
}
