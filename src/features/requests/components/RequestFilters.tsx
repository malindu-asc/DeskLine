import {X} from "lucide-react";
import {Button} from "../../../components/ui/Button";

interface RequestFiltersProps {
  search: string;
  status: string;
  priority: string;
  category: string;

  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onClearFilters: () => void;

  // Queue-only - My Requests simply doesn't pass these, so the control never renders there.
  assignee?: string;
  onAssigneeChange?: (value: string) => void;
}

const labelClassName = "w-20 shrink-0 text-sm font-medium whitespace-nowrap text-[var(--color-text)]";
const controlClassName =
  "min-w-0 flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-info)]";

function RequestFilters({
  search,
  status,
  priority,
  category,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onCategoryChange,
  assignee,
  onAssigneeChange,
  onClearFilters,
}: RequestFiltersProps) {

    const hasActiveFilters =
  search !== "" ||
  status !== "all" ||
  priority !== "all" ||
  category !== "all" ||
  (assignee !== undefined && assignee !== "all");
  
  return (
    <section className="@container rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
      {/* Plain string, not cn() - Queue and My Requests used to split
          5-vs-4 columns here, but 5 equal columns didn't leave enough
          room for select text like "Unassigned" to fit without
          truncating. Both now share this same 4-column cap (Assignee,
          Queue's 5th field, wraps to its own row), so there's no
          longer a condition for cn() to merge. */}
      <div className="grid grid-cols-1 gap-4 @lg:grid-cols-2 @3xl:grid-cols-4">
        {/* Search */}
        <div className="flex items-center gap-2">
          <label htmlFor="filter-search" className={labelClassName}>
            Search
          </label>
          <input
            id="filter-search"
            type="text"
            placeholder="Search requests..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className={controlClassName}
          />
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <label htmlFor="filter-status" className={labelClassName}>
            Status
          </label>
          <select
            id="filter-status"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className={controlClassName}
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Priority */}
        <div className="flex items-center gap-2">
          <label htmlFor="filter-priority" className={labelClassName}>
            Priority
          </label>
          <select
            id="filter-priority"
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className={controlClassName}
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Category */}
        <div className="flex items-center gap-2">
          <label htmlFor="filter-category" className={labelClassName}>
            Category
          </label>
          <select
            id="filter-category"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className={controlClassName}
          >
            <option value="all">All Categories</option>
            <option value="hardware">Hardware</option>
            <option value="software">Software</option>
            <option value="facilities">Facilities</option>
            <option value="access">Access</option>
          </select>
        </div>

        {/* Assignee - Queue only */}
        {onAssigneeChange && (
          <div className="flex items-center gap-2">
            <label htmlFor="filter-assignee" className={labelClassName}>
              Assignee
            </label>
            <select
              id="filter-assignee"
              value={assignee ?? "all"}
              onChange={(e) => onAssigneeChange(e.target.value)}
              className={controlClassName}
            >
              <option value="all">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              <option value="me">Assigned to me</option>
            </select>
          </div>
        )}
      </div>
      {hasActiveFilters && (
        <div className="mt-3 flex justify-end">
          <Button variant="ghost" onClick={onClearFilters}>
            <X className="size-4" />
            Clear filters
          </Button>
        </div>
      )}
    </section>
  );
}

export default RequestFilters;
