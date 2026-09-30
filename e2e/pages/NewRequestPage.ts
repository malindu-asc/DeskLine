import type { Locator, Page } from "@playwright/test";

import { AppHeader } from "../components/AppHeader";

export interface NewRequestInput {
  title: string;
  description: string;
  category: "hardware" | "software" | "facilities" | "access";
  priority: "low" | "medium" | "high";
}

/** pages/NewRequestPage.tsx - requester-only, reached from My Requests. */
export class NewRequestPage {
  private readonly page: Page;
  readonly header: AppHeader;
  readonly heading: Locator;
  readonly backButton: Locator;
  readonly title: Locator;
  readonly description: Locator;
  readonly category: Locator;
  readonly priority: Locator;
  readonly createButton: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new AppHeader(page);
    this.heading = page.getByRole("heading", { name: "New Request", exact: true });
    this.backButton = page.getByRole("button", { name: "Back to My Requests" });
    this.title = page.locator("#title");
    this.description = page.locator("#description");
    this.category = page.locator("#category");
    this.priority = page.locator("#priority");
    this.createButton = page.getByRole("button", { name: /Create request|Creating/ });
    this.errorAlert = page.getByRole("alert");
  }

  async goto(): Promise<void> {
    await this.page.goto("/requests/new");
  }

  async fill(input: NewRequestInput): Promise<void> {
    await this.title.fill(input.title);
    await this.description.fill(input.description);
    await this.category.selectOption(input.category);
    await this.priority.selectOption(input.priority);
  }

  async submit(): Promise<void> {
    await this.createButton.click();
  }

  /** See LoginPage.touch - the same `touched` gate applies to every field here. */
  async touch(field: "title" | "description" | "category" | "priority"): Promise<void> {
    await this[field].focus();
    await this[field].blur();
  }

  fieldError(message: string): Locator {
    return this.page.getByText(message, { exact: true });
  }
}
