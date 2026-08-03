import AppLayout from "../layouts/AppLayout";
import { useRequestFilters } from "../features/requests/hooks/useRequestFilters";
import RequestFilters from "../features/requests/components/RequestFilters";
import RequestList from "../features/requests/components/RequestList";

import { requests } from "../data";

function QueuePage() {
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
        />

        <RequestList
          requests={filteredRequests}
          totalCount={requests.length}
          emptyTitle="The queue is empty"
          emptyDescription="There are no requests to work on right now."
        />

      </section>

    </AppLayout>
  );
}

export default QueuePage;
