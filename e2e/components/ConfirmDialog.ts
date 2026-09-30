import type { Locator, Page } from "@playwright/test";

/**
 * The confirm modal for close and cancel.
 *
 * Buttons are resolved inside the dialog: the confirm button shares its label
 * with the action button that opened it, so a page-level lookup matches two.
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

  async confirm(label: string): Promise<void> {
    await this.button(label).click();
  }

  async dismiss(label = "Keep request"): Promise<void> {
    await this.button(label).click();
  }
}
