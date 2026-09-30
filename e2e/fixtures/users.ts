// The three seed users, duplicated from src/data/users.ts rather than imported:
// e2e/ is a separate TypeScript project, and a fixture that silently follows a
// production refactor stops catching regressions.

export type Role = "requester" | "technician" | "admin";

export interface SeedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

/** Shared by all seed users. */
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

/** The token format the mock API's getActingUser() parses. */
export function tokenFor(user: SeedUser): string {
  return `demo-token-${user.id}`;
}

/** Where each role lands after login. */
export function homeRouteFor(role: Role): string {
  return role === "requester" ? "/my-requests" : "/queue";
}
