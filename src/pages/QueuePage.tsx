import AppLayout from "../layouts/AppLayout";
import { useRequestFilters } from "../features/requests/hooks/useRequestFilters";
import RequestFilters from "../features/requests/components/RequestFilters";
import RequestList from "../features/requests/components/RequestList";
import { Button } from "../components/ui/Button";
import { filterByAssignee, type AssigneeFilter } from "../features/requests/utils/filterByAssignee";
import { useAuth } from "../features/auth/useAuth";

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Request, User } from "../shared/types";
import { requestService } from "../services/requestService";
import { userService } from "../services/userService";

function QueuePage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

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
    filteredRequests,
    clearAll
  } = useRequestFilters(requests);

  const assignee = (searchParams.get("assignee") ?? "all") as AssigneeFilter;

  function setAssignee(value: string) {
    const next = new URLSearchParams(searchParams);

    if (value === "all") {
      next.delete("assignee");
    } else {
      next.set("assignee", value);
    }

    setSearchParams(next);
  }

  const visibleRequests = user
    ? filterByAssignee(filteredRequests, assignee, user.id)
    : filteredRequests;

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
        <p className="p-6">Loading queue...</p>
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

  return (
    <AppLayout>
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">
          Queue
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
          assignee={assignee}
          onAssigneeChange={setAssignee}
          onClearFilters={clearAll}
        />

        <RequestList
          requests={visibleRequests}
          users={users}
          totalCount={requests.length}
          emptyTitle="The queue is empty"
          emptyDescription="There are no requests to work on right now."
        />

      </section>

    </AppLayout>
  );
}

export default QueuePage;
