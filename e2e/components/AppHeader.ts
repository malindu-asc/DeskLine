import type { Locator, Page } from "@playwright/test";

/**
 * The application chrome rendered by layouts/AppLayout.tsx - present on every
 * authenticated page, absent on the login screen.
 *
 * Everything here is scoped to the banner landmark. That matters: RequestCard
 * renders the ASSIGNEE name on every one of the 503 seeded rows, so an unscoped
 * lookup for a staff name matches hundreds of elements and trips strict mode.
 * The header is the only place that states who is actually signed in.
 */
export class AppHeader {
  readonly root: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.root = page.getByRole("banner");
    this.logoutButton = this.root.getByRole("button", { name: "Logout" });
  }

  /** The signed-in user's name, as shown in the header. */
  signedInAs(name: string): Locator {
    return this.root.getByText(name, { exact: true });
  }

  /** A top-level nav link. Only the links the current role may use are rendered. */
  navLink(label: string): Locator {
    return this.root.getByRole("link", { name: label });
  }


  async logout(): Promise<void> {
    await this.logoutButton.click();
  }
}
