import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import { useRequestFilters } from "../features/requests/hooks/useRequestFilters";
import RequestFilters from "../features/requests/components/RequestFilters";
import RequestList from "../features/requests/components/RequestList";
import { Button } from "../components/ui/Button";

import { useEffect, useState } from "react";
import type { Request, User } from "../shared/types";
import { requestService } from "../services/requestService";
import { userService } from "../services/userService";

function MyRequestsPage() {

  const [requests, setRequests] = useState<Request[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const {
    search,
    status,
    priority,
    category,
    setSearch,
    setStatus,
    setPriority,
    setCategory,
    clearAll,
    filteredRequests,
  } = useRequestFilters(requests);

  useEffect(() => {
    async function loadRequests() {
      try {
        setLoading(true);

        const [requestsData, usersData] = await Promise.all([
          requestService.getAll(),
          userService.getAll(),
        ]);

        setRequests(requestsData);
        setUsers(usersData);
        setError(null);
      } catch {
        setError("Failed to load requests.");
      } finally {
        setLoading(false);
      }
    }

    loadRequests();
  }, [retryCount]);

  if (loading) {
    return (
      <AppLayout>
        <p className="p-6">Loading requests...</p>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="space-y-4 p-6">
          <p>{error}</p>

          <Button onClick={() => setRetryCount((count) => count + 1)}>Retry</Button>
        </div>
      </AppLayout>
    );
  }

  const newRequestButton = (
    <Link to="/requests/new">
      <Button variant="info">
        <Plus className="size-4" />
        New Request
      </Button>
    </Link>
  );

  return (
    <AppLayout>
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">
            My Requests
          </h2>

          {newRequestButton}
        </div>

        <RequestFilters
          search={search}
          status={status}
          priority={priority}
          category={category}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onPriorityChange={setPriority}
          onCategoryChange={setCategory}
          onClearFilters={clearAll}
        />

        <RequestList
          requests={filteredRequests}
          users={users}
          totalCount={requests.length}
          emptyTitle="You have no requests yet"
          emptyDescription="Create a new request to get started."
          emptyAction={newRequestButton}
        />

      </section>

    </AppLayout>
  );
}

export default MyRequestsPage;
