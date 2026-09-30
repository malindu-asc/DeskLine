import { test, expect } from "../fixtures/pages";
import { COMMENTS, aNewRequest } from "../fixtures/test-data";
import { UNASSIGNED_LABEL } from "../fixtures/requests";
import { USERS } from "../fixtures/users";

/**
 * FLOW 1 - Full ticket lifecycle across all three roles.
 *
 * One test, not several: the value is that one role's write is visible to the
 * next, and splitting it would leave that hand-off untested.
 *
 * Never reloads the page. src/mocks/db.ts is module-scoped, so a full load
 * re-seeds the mock database and would destroy the ticket mid-flow. Logging out
 * is a router push, so the data survives a role switch.
 */
test.describe("Flow 1 - Ticket lifecycle", () => {
  test("a ticket is raised, triaged, closed, and seen closed by its requester", async ({
    page,
    loginPage,
    myRequestsPage,
    newRequestPage,
    queuePage,
    requestDetailPage,
  }) => {
    const ticket = aNewRequest();

    await test.step("Requester signs in", async () => {
      await loginPage.goto();
      await loginPage.signInAs("requester");

      await expect(page).toHaveURL(/\/my-requests$/);
      await expect(myRequestsPage.heading).toBeVisible();
      await expect(myRequestsPage.header.signedInAs(USERS.requester.name)).toBeVisible();
    });

    await test.step("The new-request form rejects invalid input", async () => {
      await myRequestsPage.startNewRequest();
      await expect(newRequestPage.heading).toBeVisible();
      await expect(newRequestPage.createButton).toBeDisabled();

      await newRequestPage.title.fill("AB");
      await newRequestPage.touch("title");
      await expect(newRequestPage.fieldError("Title must be at least 3 characters.")).toBeVisible();

      await newRequestPage.description.fill("too short");
      await newRequestPage.touch("description");
      await expect(
        newRequestPage.fieldError("Description must be at least 10 characters.")
      ).toBeVisible();

      await newRequestPage.touch("category");
      await expect(newRequestPage.fieldError("Please select a category.")).toBeVisible();

      await newRequestPage.touch("priority");
      await expect(newRequestPage.fieldError("Please select a priority.")).toBeVisible();

      await expect(newRequestPage.createButton).toBeDisabled();
    });

    await test.step("Requester corrects the form and creates the ticket", async () => {
      await newRequestPage.fill(ticket);

      await expect(newRequestPage.fieldError("Title must be at least 3 characters.")).toBeHidden();
      await expect(newRequestPage.createButton).toBeEnabled();

      await newRequestPage.submit();

      await expect(page).toHaveURL(/\/my-requests$/);
    });

    await test.step("The ticket is listed and opens with the right details", async () => {
      await myRequestsPage.findByTitle(ticket.title);
      await expect(myRequestsPage.card(ticket.title)).toHaveCount(1);

      await myRequestsPage.openByTitle(ticket.title);

      await expect(requestDetailPage.title).toHaveText(ticket.title);
      await expect(requestDetailPage.statusBadge).toHaveText("open");
      await expect(requestDetailPage.priorityBadge).toHaveText(ticket.priority);
      await expect(requestDetailPage.categoryBadge).toHaveText(ticket.category);
      await expect(requestDetailPage.requesterValue).toContainText(USERS.requester.name);
      await expect(requestDetailPage.assigneeValue).toContainText(UNASSIGNED_LABEL);

      // The description is stored as the thread's first message, not on the
      // request. If that second POST is ever dropped, only this assertion fails.
      await expect(requestDetailPage.message(ticket.description)).toBeVisible();

      await expect(requestDetailPage.setPendingButton).toBeHidden();
      await expect(requestDetailPage.closeRequestButton).toBeHidden();
    });

    await test.step("Requester signs out", async () => {
      await requestDetailPage.header.logout();
      await expect(page).toHaveURL(/\/login$/);
    });

    await test.step("Technician signs in and finds the ticket in the queue", async () => {
      await loginPage.signInAs("technician");

      await expect(page).toHaveURL(/\/queue$/);
      await expect(queuePage.heading).toBeVisible();
      await expect(queuePage.header.signedInAs(USERS.technician.name)).toBeVisible();

      // The hand-off: a ticket the requester created moments ago, now visible to
      // a different role in a different list.
      await queuePage.findByTitle(ticket.title);
      await expect(queuePage.card(ticket.title)).toHaveCount(1);

      await queuePage.openByTitle(ticket.title);
      await expect(requestDetailPage.title).toHaveText(ticket.title);
    });

    await test.step("Technician assigns the ticket to themselves", async () => {
      await expect(requestDetailPage.assigneeValue).toContainText(UNASSIGNED_LABEL);

      await requestDetailPage.assignToSelf();

      await expect(requestDetailPage.assigneeValue).toContainText(USERS.technician.name);
      await expect(requestDetailPage.assignToMeButton).toBeHidden();
    });

    await test.step("Technician comments on the ticket", async () => {
      await requestDetailPage.postComment(COMMENTS.technician);

      await expect(requestDetailPage.message(COMMENTS.technician)).toBeVisible();
      await expect(requestDetailPage.commentBox).toHaveValue("");
    });

    await test.step("Technician moves the ticket to pending", async () => {
      await requestDetailPage.setPending();

      await expect(requestDetailPage.statusBadge).toHaveText("pending");
      await expect(requestDetailPage.setPendingButton).toBeHidden();
      await expect(requestDetailPage.reopenButton).toBeVisible();
    });

    await test.step("Technician signs out", async () => {
      await requestDetailPage.header.logout();
      await expect(page).toHaveURL(/\/login$/);
    });

    await test.step("Admin signs in and closes the ticket", async () => {
      await loginPage.signInAs("admin");

      await expect(page).toHaveURL(/\/queue$/);
      await expect(queuePage.header.signedInAs(USERS.admin.name)).toBeVisible();

      await queuePage.findByTitle(ticket.title);
      await queuePage.openByTitle(ticket.title);

      // The technician's work carried across the role switch.
      await expect(requestDetailPage.statusBadge).toHaveText("pending");
      await expect(requestDetailPage.assigneeValue).toContainText(USERS.technician.name);

      await requestDetailPage.openCloseDialog();
      await expect(requestDetailPage.confirmDialog.title).toHaveText("Close this request?");

      await requestDetailPage.confirmDialog.confirm("Close request");

      await expect(requestDetailPage.statusBadge).toHaveText("closed");
    });

    await test.step("Admin signs out", async () => {
      await requestDetailPage.header.logout();
      await expect(page).toHaveURL(/\/login$/);
    });

    await test.step("Requester sees the ticket closed and the thread locked", async () => {
      await loginPage.signInAs("requester");

      await expect(page).toHaveURL(/\/my-requests$/);
      await myRequestsPage.findByTitle(ticket.title);
      await myRequestsPage.openByTitle(ticket.title);

      await expect(requestDetailPage.statusBadge).toHaveText("closed");
      await expect(requestDetailPage.assigneeValue).toContainText(USERS.technician.name);

      // Terminal status locks the thread for everyone, owner included.
      await expect(requestDetailPage.commentBox).toBeHidden();
      await expect(requestDetailPage.readOnlyNotice).toBeVisible();

      // The whole history survived the round trip.
      await expect(requestDetailPage.message(ticket.description)).toBeVisible();
      await expect(requestDetailPage.message(COMMENTS.technician)).toBeVisible();
      await expect(requestDetailPage.message("Closed by admin")).toBeVisible();
    });
  });
});
