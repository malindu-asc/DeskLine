import { useState } from "react";

import AppLayout from "./layouts/AppLayout";
import { filterRequests } from "./features/requests/utils/filterRequests";
import RequestFilters from "./features/requests/components/RequestFilters";
import RequestList from "./features/requests/components/RequestList";

import { requests } from "./data";

function App() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [category, setCategory] = useState("all");

  const filteredRequests = filterRequests(requests, {
    search,
    status,
    priority,
    category,
  });

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

        <RequestList requests={filteredRequests} />

      </section>

    </AppLayout>
  );
}

export default App;