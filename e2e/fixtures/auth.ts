import type { Page } from "@playwright/test";

import { USERS, tokenFor, type Role, type SeedUser } from "./users";

/** localStorage key used by src/services/session.ts. */
const STORAGE_KEY = "deskline_session";

/**
 * Authenticates the app without driving the login form.
 *
 * AuthProvider reads localStorage synchronously in its useState initialiser, so
 * a session written before the bundle evaluates means the app boots already
 * logged in - no navigation, no network round trip, no spinner.
 *
 * addInitScript (not an evaluate after goto) is required: it runs before any
 * page script on every navigation in this context, which is the only way to be
 * ahead of AuthProvider's first render.
 *
 * Only UI-01's login tests should drive the real form. Everything else seeds,
 * which removes roughly 3s per test and the largest single source of flake.
 */
export async function seedSession(page: Page, role: Role): Promise<SeedUser> {
  const user = USERS[role];

  const payload = {
    key: STORAGE_KEY,
    value: JSON.stringify({ user, token: tokenFor(user) }),
  };

  await page.addInitScript((session: { key: string; value: string }) => {
    window.localStorage.setItem(session.key, session.value);
  }, payload);

  return user;
}

/**
 * Explicitly clears any seeded session. Only needed when a test seeds first and
 * then wants to assert the unauthenticated path in the same context.
 */
export async function clearSession(page: Page): Promise<void> {
  await page.addInitScript((key: string) => {
    window.localStorage.removeItem(key);
  }, STORAGE_KEY);
}
