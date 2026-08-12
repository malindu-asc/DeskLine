// One shared demo password across all seed users, kept separate from the
// User type — a real API should never return a password field on the
// user object it sends back, so the mock shouldn't model it that way either.
export const DEMO_PASSWORD = "password123";
