import type { Locator, Page } from "@playwright/test";

import { DEMO_PASSWORD, USERS, type Role } from "../fixtures/users";

/** The only unauthenticated screen. */
export class LoginPage {
  private readonly page: Page;
  readonly heading: Locator;
  readonly subtitle: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly signInButton: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "DeskLine" });
    this.subtitle = page.getByText("Sign in to continue");
    this.email = page.locator("#email");
    this.password = page.locator("#password");
    this.signInButton = page.getByRole("button", { name: "Sign In" });
    this.errorAlert = page.getByRole("alert");
  }

  async goto(): Promise<void> {
    await this.page.goto("/login");
  }

  async signInAs(role: Role): Promise<void> {
    await this.signIn(USERS[role].email, DEMO_PASSWORD);
  }

  async signIn(email: string, password: string): Promise<void> {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.signInButton.click();
  }

  /** Errors only render once a field is touched, so blur is required. */
  async touch(field: "email" | "password"): Promise<void> {
    const locator = field === "email" ? this.email : this.password;
    await locator.focus();
    await locator.blur();
  }

  fieldError(message: string): Locator {
    return this.page.getByText(message, { exact: true });
  }
}
