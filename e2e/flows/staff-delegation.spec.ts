import { test, expect } from "../fixtures/pages";
import { FIXTURE_REQUESTS, UNASSIGNED_LABEL } from "../fixtures/requests";
import { USERS } from "../fixtures/users";

/**
 * FLOW 2 - Staff delegation and state transitions.
 *
 * A technician works a ticket and hands it back; an admin reassigns it to
 * someone else and closes it. Covers the two things Flow 1 does not: the
 * pending -> open transition, and reassignment - the only action that writes to
 * another user's workload, and the only one restricted to admins.
 *
 * Starts from the seeded r1 rather than creating a ticket: creation is not what
 * this flow tests, and every test gets a fresh mock database, so r1 is open and
 * unassigned on every run.
 */
const ticket = FIXTURE_REQUESTS.r1;

test.describe("Flow 2 - Staff delegation", () => {
  test("a technician works a ticket, then an admin reassigns and closes it", async ({
    page,
    loginPage,
    queuePage,
    requestDetailPage,
  }) => {
    await test.step("Technician signs in", async () => {
      await loginPage.goto();
      await loginPage.signInAs("technician");

      await expect(page).toHaveURL(/\/queue$/);
      await expect(queuePage.heading).toBeVisible();
      await expect(queuePage.header.signedInAs(USERS.technician.name)).toBeVisible();
    });

    await test.step("Technician picks the ticket out of the queue", async () => {
      await queuePage.findByTitle(ticket.title);
      await expect(queuePage.card(ticket.title)).toHaveCount(1);

      await queuePage.openByTitle(ticket.title);

      await expect(requestDetailPage.title).toHaveText(ticket.title);
      await expect(requestDetailPage.statusBadge).toHaveText(ticket.status);
      await expect(requestDetailPage.assigneeValue).toContainText(UNASSIGNED_LABEL);
    });

    await test.step("Technician assigns the ticket to themselves", async () => {
      await requestDetailPage.assignToSelf();

      await expect(requestDetailPage.assigneeValue).toContainText(USERS.technician.name);
      await expect(requestDetailPage.assignToMeButton).toBeHidden();
    });

    await test.step("Technician moves the ticket to pending", async () => {
      await requestDetailPage.setPending();

      await expect(requestDetailPage.statusBadge).toHaveText("pending");
      await expect(requestDetailPage.setPendingButton).toBeHidden();
      await expect(requestDetailPage.reopenButton).toBeVisible();
    });

    await test.step("Technician reopens the ticket", async () => {
      await requestDetailPage.reopen();

      // pending -> open. The other direction of the transition Flow 1 covers.
      await expect(requestDetailPage.statusBadge).toHaveText("open");
      await expect(requestDetailPage.reopenButton).toBeHidden();
      await expect(requestDetailPage.setPendingButton).toBeVisible();
    });

    await test.step("Technician has no admin-only controls", async () => {
      // Both are admin-only. The PATCH handler would reject them too, so both
      // layers have to regress for this to go unnoticed.
      await expect(requestDetailPage.closeRequestButton).toBeHidden();
      await expect(requestDetailPage.reassignSelect).toBeHidden();
    });

    await test.step("Technician signs out", async () => {
      await requestDetailPage.header.logout();
      await expect(page).toHaveURL(/\/login$/);
    });

    await test.step("Admin signs in and opens the same ticket", async () => {
      await loginPage.signInAs("admin");

      await expect(page).toHaveURL(/\/queue$/);
      await expect(queuePage.header.signedInAs(USERS.admin.name)).toBeVisible();

      await queuePage.findByTitle(ticket.title);
      await queuePage.openByTitle(ticket.title);

      // The technician's assignment carried across the role switch.
      await expect(requestDetailPage.assigneeValue).toContainText(USERS.technician.name);
      await expect(requestDetailPage.statusBadge).toHaveText("open");
    });

    await test.step("Admin reassigns the ticket to another staff member", async () => {
      await expect(requestDetailPage.reassignSelect).toBeVisible();

      await requestDetailPage.reassignTo(USERS.admin.name);

      await expect(requestDetailPage.assigneeValue).toContainText(USERS.admin.name);
      await expect(requestDetailPage.assigneeValue).not.toContainText(USERS.technician.name);
    });

    await test.step("Admin closes the ticket", async () => {
      await requestDetailPage.openCloseDialog();
      await expect(requestDetailPage.confirmDialog.title).toHaveText("Close this request?");

      await requestDetailPage.confirmDialog.confirm("Close request");

      await expect(requestDetailPage.statusBadge).toHaveText("closed");
    });

    await test.step("The closed ticket is read-only and has no actions", async () => {
      await expect(requestDetailPage.commentBox).toBeHidden();
      await expect(requestDetailPage.readOnlyNotice).toBeVisible();

      // hasAnyAction is false for a closed request, so the whole panel goes.
      await expect(requestDetailPage.setPendingButton).toBeHidden();
      await expect(requestDetailPage.reassignSelect).toBeHidden();
      await expect(requestDetailPage.closeRequestButton).toBeHidden();

      // The close wrote an audit message before the status change.
      await expect(requestDetailPage.message("Closed by admin")).toBeVisible();
    });
  });
});
