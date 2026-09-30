import { test as base } from "@playwright/test";

import { LoginPage } from "../pages/LoginPage";
import { MyRequestsPage } from "../pages/MyRequestsPage";
import { NewRequestPage } from "../pages/NewRequestPage";
import { QueuePage } from "../pages/QueuePage";
import { RequestDetailPage } from "../pages/RequestDetailPage";

/**
 * Page objects delivered as Playwright fixtures, so specs declare what they need
 * instead of constructing objects by hand. All wrap the same page instance.
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
