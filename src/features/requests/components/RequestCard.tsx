import { Link } from "react-router-dom";

import type { Request } from "../../../shared/types";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";

interface RequestCardProps {
  request: Request;
}

function RequestCard({ request }: RequestCardProps) {
  return (
    <Link to={`/requests/${request.id}`} className="block">
      <Card className="flex items-start justify-between transition-colors hover:border-[var(--color-info)]">
        <div>
          <h3 className="text-lg font-semibold">{request.title}</h3>

          <div className="mt-3 flex flex-wrap gap-2">
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
      </Card>
    </Link>
  );
}

export default RequestCard;
