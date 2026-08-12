import type { UserRole } from "../../../shared/types";

export function getHomeRoute(role: UserRole): string {
  return role === "requester" ? "/my-requests" : "/queue";
}
