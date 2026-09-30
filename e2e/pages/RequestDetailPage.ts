import type { Locator, Page } from "@playwright/test";

import { AppHeader } from "../components/AppHeader";
import { ConfirmDialog } from "../components/ConfirmDialog";

/**
 * A single request. Which controls appear depends on role, ownership and status.
 *
 * Several locators walk from a heading to its sibling. The page has no test
 * hooks and the labels alone are ambiguous - "Close request" is both an action
 * button and the confirm button of the dialog it opens.
 */
export class RequestDetailPage {
  private readonly page: Page;
  readonly header: AppHeader;
  readonly confirmDialog: ConfirmDialog;

  readonly title: Locator;
  readonly statusBadge: Locator;
  readonly priorityBadge: Locator;
  readonly categoryBadge: Locator;
  readonly requesterValue: Locator;
  readonly assigneeValue: Locator;

  readonly actionsPanel: Locator;
  readonly setPendingButton: Locator;
  readonly reopenButton: Locator;
  readonly assignToMeButton: Locator;
  readonly reassignSelect: Locator;
  readonly reassignButton: Locator;
  readonly closeRequestButton: Locator;
  readonly cancelRequestButton: Locator;

  readonly activityPanel: Locator;
  readonly commentBox: Locator;
  readonly sendButton: Locator;
  readonly readOnlyNotice: Locator;

  readonly loadingState: Locator;
  readonly errorAlert: Locator;
  readonly notFoundHeading: Locator;
  readonly forbiddenHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new AppHeader(page);
    this.confirmDialog = new ConfirmDialog(page);

    // The title is the only h2; Actions and Activity are h3.
    this.title = page.getByRole("heading", { level: 2 });

    // Badges sit in the div after the title, in a fixed order.
    const badges = this.title.locator("xpath=following-sibling::div[1]").locator("span");
    this.statusBadge = badges.nth(0);
    this.priorityBadge = badges.nth(1);
    this.categoryBadge = badges.nth(2);

    this.requesterValue = RequestDetailPage.definitionFor(page, "Requester");
    this.assigneeValue = RequestDetailPage.definitionFor(page, "Assignee");

    this.actionsPanel = RequestDetailPage.sectionAfter(page, "Actions");
    this.setPendingButton = this.actionsPanel.getByRole("button", { name: "Set Pending" });
    this.reopenButton = this.actionsPanel.getByRole("button", { name: "Reopen" });
    this.assignToMeButton = this.actionsPanel.getByRole("button", { name: "Assign to me" });
    this.reassignSelect = page.locator("#reassign-select");
    this.reassignButton = this.actionsPanel.getByRole("button", { name: "Reassign", exact: true });
    this.closeRequestButton = this.actionsPanel.getByRole("button", { name: "Close request" });
    this.cancelRequestButton = this.actionsPanel.getByRole("button", { name: "Cancel request" });

    this.activityPanel = RequestDetailPage.sectionAfter(page, "Activity");
    this.commentBox = page.locator("#comment");
    this.sendButton = page.getByRole("button", { name: /Send|Sending/ });
    this.readOnlyNotice = page.getByText(/the thread is read-only/);

    this.loadingState = page.getByRole("status");
    this.errorAlert = page.getByRole("alert");
    this.notFoundHeading = page.getByRole("heading", { name: "Request not found" });
    this.forbiddenHeading = page.getByRole("heading", { name: "Not authorized" });
  }

  /** <dt> label to its <dd> value. */
  private static definitionFor(page: Page, label: string): Locator {
    return page
      .locator("dt")
      .filter({ hasText: new RegExp(`^${label}$`) })
      .locator("xpath=following-sibling::dd")
      .first();
  }

  /** Section heading to the panel that follows it. */
  private static sectionAfter(page: Page, heading: string): Locator {
    return page
      .locator("h3")
      .filter({ hasText: new RegExp(`^${heading}$`) })
      .locator("xpath=following-sibling::div")
      .first();
  }

  async gotoById(id: string): Promise<void> {
    await this.page.goto(`/requests/${id}`);
  }

  async assignToSelf(): Promise<void> {
    await this.assignToMeButton.click();
  }

  async setPending(): Promise<void> {
    await this.setPendingButton.click();
  }

  async reopen(): Promise<void> {
    await this.reopenButton.click();
  }

  async reassignTo(staffName: string): Promise<void> {
    await this.reassignSelect.selectOption({ label: staffName });
    await this.reassignButton.click();
  }

  async postComment(body: string): Promise<void> {
    await this.commentBox.fill(body);
    await this.sendButton.click();
  }

  async openCloseDialog(): Promise<void> {
    await this.closeRequestButton.click();
  }

  async closeRequest(): Promise<void> {
    await this.openCloseDialog();
    await this.confirmDialog.confirm("Close request");
  }

  async openCancelDialog(): Promise<void> {
    await this.cancelRequestButton.click();
  }

  async cancelRequest(): Promise<void> {
    await this.openCancelDialog();
    await this.confirmDialog.confirm("Cancel request");
  }

  message(body: string): Locator {
    return this.activityPanel.getByText(body, { exact: true });
  }
}
