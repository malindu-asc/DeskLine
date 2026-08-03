import AppLayout from "../layouts/AppLayout";
import { useRequestFilters } from "../features/requests/hooks/useRequestFilters";
import RequestFilters from "../features/requests/components/RequestFilters";
import RequestList from "../features/requests/components/RequestList";

import { useEffect, useState } from "react";
import type { Request } from "../shared/types";
import { requestService } from "../services/requestService";

function MyRequestsPage() {

  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    search,
    status,
    priority,
    category,
    setSearch,
    setStatus,
    setPriority,
    setCategory,
    filteredRequests,
  } = useRequestFilters(requests);

  // Load requests from the API
  const loadRequests = async () => {
  try {
    setLoading(true);

    const data = await requestService.getAll();

    setRequests(data);
    setError(null);
  } catch {
    setError("Failed to load requests.");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadRequests();
}, []);

  return (
    <AppLayout>
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">
          My Requests
        </h2>

        <RequestFilters
          search={search}
          status={status}
          priority={priority}
          category={category}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onPriorityChange={setPriority}
          onCategoryChange={setCategory}
        />

        <RequestList
          requests={filteredRequests}
          totalCount={requests.length}
          emptyTitle="You have no requests yet"
          emptyDescription="Create a new request to get started."
        />

      </section>

    </AppLayout>
  );
}

export default MyRequestsPage;
