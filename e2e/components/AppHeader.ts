import type { Locator, Page } from "@playwright/test";

/**
 * AppLayout's header - on every authenticated page.
 *
 * Scoped to the banner: RequestCard shows the assignee name on all 503 rows, so
 * an unscoped name lookup matches hundreds of elements.
 */
export class AppHeader {
  readonly root: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.root = page.getByRole("banner");
    this.logoutButton = this.root.getByRole("button", { name: "Logout" });
  }

  signedInAs(name: string): Locator {
    return this.root.getByText(name, { exact: true });
  }

  navLink(label: string): Locator {
    return this.root.getByRole("link", { name: label });
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }
}
