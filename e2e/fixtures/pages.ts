import { test as base } from "@playwright/test";

import { LoginPage } from "../pages/LoginPage";
import { MyRequestsPage } from "../pages/MyRequestsPage";
import { NewRequestPage } from "../pages/NewRequestPage";
import { QueuePage } from "../pages/QueuePage";
import { RequestDetailPage } from "../pages/RequestDetailPage";

/**
 * Page objects delivered through Playwright's own fixture mechanism, so specs
 * declare what they need in the test signature instead of constructing objects
 * by hand.
 *
 * All of them wrap the SAME page instance. That is what makes a cross-role flow
 * readable: signing out and back in as another role changes which page object is
 * meaningful, not which browser context the test is driving.
 */
interface Pages {
  loginPage: LoginPage;
  myRequestsPage: MyRequestsPage;
  queuePage: QueuePage;
  newRequestPage: NewRequestPage;
  requestDetailPage: RequestDetailPage;
}

export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  myRequestsPage: async ({ page }, use) => {
    await use(new MyRequestsPage(page));
  },
  queuePage: async ({ page }, use) => {
    await use(new QueuePage(page));
  },
  newRequestPage: async ({ page }, use) => {
    await use(new NewRequestPage(page));
  },
  requestDetailPage: async ({ page }, use) => {
    await use(new RequestDetailPage(page));
  },
});

export { expect } from "@playwright/test";
