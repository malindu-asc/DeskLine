import type { User } from "../types";

export function getUserName(users: User[], userId: string | null): string {
  if (!userId) return "Unassigned";
  return users.find((user) => user.id === userId)?.name ?? "Unknown";
}
