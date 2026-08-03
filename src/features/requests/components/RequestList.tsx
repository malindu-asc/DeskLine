import type { Request } from "../../../shared/types";
import RequestCard from "./RequestCard";

interface RequestListProps {
  requests: Request[];
  totalCount: number;
  emptyTitle?: string;
  emptyDescription?: string;
}

function RequestList({
  requests,
  totalCount,
  emptyTitle = "No requests yet",
  emptyDescription = "Requests will show up here once they exist.",
}: RequestListProps) {
  if (totalCount === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--color-border)] p-10 text-center">
        <h3 className="text-lg font-semibold">{emptyTitle}</h3>

        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          {emptyDescription}
        </p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--color-border)] p-10 text-center">
        <h3 className="text-lg font-semibold">No matches</h3>

        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Try changing your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <RequestCard
          key={request.id}
          request={request}
        />
      ))}
    </div>
  );
}

export default RequestList;
