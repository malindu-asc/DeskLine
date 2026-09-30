import type { Locator, Page } from "@playwright/test";

/**
 * The filter bar from features/requests/components/RequestFilters.tsx, shared by
 * My Requests and the Queue.
 *
 * Every control already carries an id in the application source, so no test
 * hooks were added to make this addressable.
 */
export class RequestFilters {
  readonly search: Locator;
  readonly status: Locator;
  readonly priority: Locator;
  readonly category: Locator;
  /** Queue only - My Requests never passes onAssigneeChange, so it is not rendered there. */
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
