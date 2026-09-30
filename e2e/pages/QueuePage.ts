import type { Page } from "@playwright/test";

import { RequestListPage } from "./RequestListPage";

/** pages/QueuePage.tsx - the staff (technician and admin) home. */
export class QueuePage extends RequestListPage {
  constructor(page: Page) {
    super(page, "Queue");
  }

  async goto(): Promise<void> {
    await this.page.goto("/queue");
  }

  /** Queue-only filter, persisted to the URL as ?assignee=. */
  async filterByAssignee(value: "all" | "unassigned" | "me"): Promise<void> {
    await this.filters.assignee.selectOption(value);
  }
}
