import type { Locator, Page } from "@playwright/test";

import { AppHeader } from "../components/AppHeader";
import { RequestFilters } from "../components/RequestFilters";

/** Shared by the two list screens - same filter bar, same cards. */
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

  /** Anchored on the card's h3 - counting bare links would also match nav links. */
  card(title: string): Locator {
    return this.page
      .locator("a")
      .filter({ has: this.page.getByRole("heading", { level: 3, name: title, exact: true }) });
  }

  /** Required - the seed data is 503 rows deep. */
  async findByTitle(title: string): Promise<void> {
    await this.filters.searchFor(title);
  }

  async openByTitle(title: string): Promise<void> {
    await this.card(title).click();
  }
}
