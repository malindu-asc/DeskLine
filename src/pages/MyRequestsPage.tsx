import AppLayout from "../layouts/AppLayout";
import { useRequestFilters } from "../features/requests/hooks/useRequestFilters";
import RequestFilters from "../features/requests/components/RequestFilters";
import RequestList from "../features/requests/components/RequestList";

import { requests } from "../data";

function MyRequestsPage() {
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
