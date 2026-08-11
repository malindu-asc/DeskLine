import { createElement } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Clock, User as UserIcon } from "lucide-react";

import type { Request, User } from "../../../shared/types";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { Avatar } from "../../../components/ui/Avatar";
import { getCategoryIcon, getCategoryIconStyles } from "../utils/getCategoryIcon";
import { cn } from "../../../shared/utils/cn";
import { getUserName } from "../../../shared/utils/getUserName";

interface RequestCardProps {
  request: Request;
  users: User[];
}

function RequestCard({ request, users }: RequestCardProps) {
  const assigneeName = getUserName(users, request.assigneeId);
  const updatedDate = new Date(request.updatedAt).toLocaleDateString(undefined, {
    dateStyle: "medium",
  });

  return (
    <Link to={`/requests/${request.id}`} className="block">
      <Card className="grid grid-cols-[minmax(0,34rem)_auto_auto_1fr] items-center gap-6 transition-colors hover:border-[var(--color-info)]">
        <div className="flex min-w-0 items-center gap-4">
          <span
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-md text-[var(--color-surface)]",
              getCategoryIconStyles(request.category)
            )}
          >
            {createElement(getCategoryIcon(request.category), { className: "size-5" })}
          </span>

          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold">{request.title}</h3>

            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant={request.status}>
                {request.status}
              </Badge>

              <Badge variant={request.priority}>
                {request.priority}
              </Badge>

              <Badge variant={request.category}>
                {request.category}
              </Badge>
            </div>
          </div>
        </div>

        {/* Fixed-width columns (w-36/w-40 on the inner div, not the grid
            track itself) so an `auto` track collapses to 0 below md instead
            of reserving dead space when these are hidden. */}
        <div className="hidden w-36 min-w-0 items-center gap-2 text-sm text-[var(--color-text-secondary)] md:flex">
          {request.assigneeId ? (
            <Avatar name={assigneeName} size="sm" />
          ) : (
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--color-border)] text-[var(--color-text-secondary)]">
              <UserIcon className="size-3.5" />
            </span>
          )}
          <span className="truncate">{assigneeName}</span>
        </div>

        <div className="hidden w-40 items-center gap-2 whitespace-nowrap text-sm text-[var(--color-text-secondary)] md:flex">
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--color-border)] text-[var(--color-text-secondary)]">
            <Clock className="size-3.5" />
          </span>
          <span>Updated {updatedDate}</span>
        </div>

        <ChevronRight className="size-5 shrink-0 justify-self-end text-[var(--color-text-secondary)]" />
      </Card>
    </Link>
  );
}

export default RequestCard;
