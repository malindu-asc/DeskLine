// The three seed users from src/data/users.ts, plus the token shape the mock
// API expects. Duplicated rather than imported: e2e/ is a separate TypeScript
// project from src/, and a test fixture that silently follows a production
// refactor is a fixture that stops catching regressions.

export type Role = "requester" | "technician" | "admin";

export interface SeedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

/** Shared demo password for all seed users - see src/mocks/credentials.ts. */
export const DEMO_PASSWORD = "password123";

export const USERS: Record<Role, SeedUser> = {
  requester: {
    id: "u1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "requester",
  },
  technician: {
    id: "u2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "technician",
  },
  admin: {
    id: "u3",
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    role: "admin",
  },
};

/**
 * Mirrors the token format the MSW handlers parse in getActingUser():
 * "demo-token-<userId>", from which the handler looks the role up in db.users.
 */
export function tokenFor(user: SeedUser): string {
  return `demo-token-${user.id}`;
}

/** Where each role is sent after login - see features/auth/utils/getHomeRoute.ts. */
export function homeRouteFor(role: Role): string {
  return role === "requester" ? "/my-requests" : "/queue";
}
