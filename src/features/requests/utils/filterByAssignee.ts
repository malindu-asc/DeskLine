import type { Request } from "../../../shared/types";

export type AssigneeFilter = "all" | "unassigned" | "me";

export function filterByAssignee(
  requests: Request[],
  assignee: AssigneeFilter,
  currentUserId: string
) {
  if (assignee === "all") {
    return requests;
  }

  if (assignee === "unassigned") {
    return requests.filter((request) => request.assigneeId === null);
  }

  return requests.filter((request) => request.assigneeId === currentUserId);
}
