import type { Locator, Page } from "@playwright/test";

import { RequestListPage } from "./RequestListPage";

/** The requester's home. */
export class MyRequestsPage extends RequestListPage {
  readonly newRequestLink: Locator;

  constructor(page: Page) {
    super(page, "My Requests");
    this.newRequestLink = page.getByRole("link", { name: "New Request" });
  }

  async goto(): Promise<void> {
    await this.page.goto("/my-requests");
  }

  async startNewRequest(): Promise<void> {
    await this.newRequestLink.click();
  }
}
