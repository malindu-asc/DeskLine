import type { Locator, Page } from "@playwright/test";

import { AppHeader } from "../components/AppHeader";
import { RequestFilters } from "../components/RequestFilters";

/**
 * Behaviour shared by the two list screens (My Requests and the Queue). Both
 * render the same RequestFilters bar and the same RequestList of RequestCards;
 * only the heading, the empty state and the assignee filter differ.
 */
export class RequestListPage {
  protected readonly page: Page;
  readonly header: AppHeader;
  readonly filters: RequestFilters;
  readonly heading: Locator;
  readonly noMatchesMessage: Locator;

  constructor(page: Page, headingName: string) {
    this.page = page;
    this.header = new AppHeader(page);
    this.filters = new RequestFilters(page);
    this.heading = page.getByRole("heading", { name: headingName, exact: true });
    this.noMatchesMessage = page.getByRole("heading", { name: "No matches" });
  }

  /**
   * A single request row, matched by its title.
   *
   * RequestCard wraps a Card in a <Link> and gives the title an <h3>, so
   * anchoring on that heading is precise without needing a data-testid. Counting
   * bare links would also pick up the header's nav links.
   */
  card(title: string): Locator {
    return this.page
      .locator("a")
      .filter({ has: this.page.getByRole("heading", { level: 3, name: title, exact: true }) });
  }

  /** Narrows the list to one request. Required - the seed data is 503 rows deep. */
  async findByTitle(title: string): Promise<void> {
    await this.filters.searchFor(title);
  }

  async openByTitle(title: string): Promise<void> {
    await this.card(title).click();
  }
}
