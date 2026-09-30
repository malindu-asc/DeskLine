import type { Locator, Page } from "@playwright/test";

/**
 * The modal from components/ui/ConfirmDialog.tsx, used to gate the destructive
 * actions (close, cancel).
 *
 * Buttons are resolved INSIDE the dialog on purpose. The confirm button carries
 * the same label as the action button that opened it ("Close request",
 * "Cancel request"), so a page-level lookup matches two elements once the dialog
 * is open and fails strict mode.
 */
export class ConfirmDialog {
  readonly root: Locator;
  readonly title: Locator;
  readonly description: Locator;

  constructor(page: Page) {
    this.root = page.getByRole("alertdialog");
    this.title = this.root.locator("#confirm-dialog-title");
    this.description = this.root.locator("p").first();
  }

  button(label: string): Locator {
    return this.root.getByRole("button", { name: label });
  }

  /** Goes through with the action. */
  async confirm(label: string): Promise<void> {
    await this.button(label).click();
  }

  /** Backs out. The default label is shared by both destructive dialogs. */
  async dismiss(label = "Keep request"): Promise<void> {
    await this.button(label).click();
  }
}
