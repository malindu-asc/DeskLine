import { createElement } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

import type { Request } from "../../../shared/types";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { getCategoryIcon, getCategoryIconStyles } from "../utils/getCategoryIcon";
import { cn } from "../../../shared/utils/cn";

interface RequestCardProps {
  request: Request;
}

function RequestCard({ request }: RequestCardProps) {
  return (
    <Link to={`/requests/${request.id}`} className="block">
      <Card className="flex items-center justify-between gap-4 transition-colors hover:border-[var(--color-info)]">
        <div className="flex items-center gap-4">
          <span
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-md text-[var(--color-surface)]",
              getCategoryIconStyles(request.category)
            )}
          >
            {createElement(getCategoryIcon(request.category), { className: "size-5" })}
          </span>

          <div>
            <h3 className="text-lg font-semibold">{request.title}</h3>

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

        <ChevronRight className="size-5 shrink-0 text-[var(--color-text-secondary)]" />
      </Card>
    </Link>
  );
}

export default RequestCard;
