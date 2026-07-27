import type { Request } from "../../../shared/types";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";

interface RequestCardProps {
  request: Request;
}

function RequestCard({ request }: RequestCardProps) {
  return (
    <Card className="flex items-start justify-between">
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
  );
}

export default RequestCard;