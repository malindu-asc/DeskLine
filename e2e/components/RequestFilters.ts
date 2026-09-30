import type { Locator, Page } from "@playwright/test";

/** The filter bar shared by My Requests and the Queue. */
export class RequestFilters {
  readonly search: Locator;
  readonly status: Locator;
  readonly priority: Locator;
  readonly category: Locator;
  /** Queue only - not rendered on My Requests. */
  readonly assignee: Locator;
  readonly clearButton: Locator;

  constructor(page: Page) {
    this.search = page.locator("#filter-search");
    this.status = page.locator("#filter-status");
    this.priority = page.locator("#filter-priority");
    this.category = page.locator("#filter-category");
    this.assignee = page.locator("#filter-assignee");
    this.clearButton = page.getByRole("button", { name: "Clear filters" });
  }

  async searchFor(text: string): Promise<void> {
    await this.search.fill(text);
  }
}
