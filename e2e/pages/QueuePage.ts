import type { Page } from "@playwright/test";

import { RequestListPage } from "./RequestListPage";

/** The staff home - technicians and admins. */
export class QueuePage extends RequestListPage {
  constructor(page: Page) {
    super(page, "Queue");
  }

  async goto(): Promise<void> {
    await this.page.goto("/queue");
  }

  async filterByAssignee(value: "all" | "unassigned" | "me"): Promise<void> {
    await this.filters.assignee.selectOption(value);
  }
}
