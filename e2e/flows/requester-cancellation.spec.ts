import { test, expect } from "../fixtures/pages";
import { FIXTURE_REQUESTS } from "../fixtures/requests";
import { COMMENTS } from "../fixtures/test-data";
import { USERS } from "../fixtures/users";

/**
 * FLOW 3 - Requester self-service and cancellation.
 *
 * A requester comments on their own ticket, then cancels it. Covers the
 * requester-owned terminal state (cancelled, as opposed to the admin-owned
 * closed in Flows 1 and 2) and both paths through the confirm dialog.
 *
 * Anchored on the seeded r1: open, and owned by the requester, which is what
 * canCancel requires.
 */
const ticket = FIXTURE_REQUESTS.r1;

test.describe("Flow 3 - Requester cancellation", () => {
  test("a requester comments on their ticket, backs out of cancelling, then cancels it", async ({
    page,
    loginPage,
    myRequestsPage,
    requestDetailPage,
  }) => {
    await test.step("Requester signs in", async () => {
      await loginPage.goto();
      await loginPage.signInAs("requester");

      await expect(page).toHaveURL(/\/my-requests$/);
      await expect(myRequestsPage.heading).toBeVisible();
      await expect(myRequestsPage.header.signedInAs(USERS.requester.name)).toBeVisible();
    });

    await test.step("Requester finds and opens their own ticket", async () => {
      await myRequestsPage.findByTitle(ticket.title);
      await expect(myRequestsPage.card(ticket.title)).toHaveCount(1);

      await myRequestsPage.openByTitle(ticket.title);

      await expect(requestDetailPage.title).toHaveText(ticket.title);
      await expect(requestDetailPage.statusBadge).toHaveText(ticket.status);
      await expect(requestDetailPage.requesterValue).toContainText(USERS.requester.name);
    });

    await test.step("Requester comments on the open ticket", async () => {
      await requestDetailPage.postComment(COMMENTS.requester);

      await expect(requestDetailPage.message(COMMENTS.requester)).toBeVisible();
      await expect(requestDetailPage.commentBox).toHaveValue("");
    });

    await test.step("Backing out of the cancel dialog changes nothing", async () => {
      await requestDetailPage.openCancelDialog();
      await expect(requestDetailPage.confirmDialog.title).toHaveText("Cancel this request?");

      await requestDetailPage.confirmDialog.dismiss();

      // The assertion most suites skip. A dialog whose cancel path still mutates
      // is a real bug class, and nothing catches it but a negative check.
      await expect(requestDetailPage.confirmDialog.root).toBeHidden();
      await expect(requestDetailPage.statusBadge).toHaveText(ticket.status);
      await expect(requestDetailPage.commentBox).toBeVisible();
      await expect(requestDetailPage.cancelRequestButton).toBeVisible();
    });

    await test.step("Requester confirms the cancellation", async () => {
      await requestDetailPage.openCancelDialog();
      await requestDetailPage.confirmDialog.confirm("Cancel request");

      await expect(requestDetailPage.statusBadge).toHaveText("cancelled");
    });

    await test.step("The cancelled ticket is read-only and has no actions", async () => {
      await expect(requestDetailPage.commentBox).toBeHidden();
      await expect(requestDetailPage.readOnlyNotice).toBeVisible();
      await expect(requestDetailPage.cancelRequestButton).toBeHidden();

      // Posted before the status change - the API rejects new messages once a
      // request leaves open/pending.
      await expect(requestDetailPage.message("Cancelled by requester")).toBeVisible();

      // The earlier comment survived the transition.
      await expect(requestDetailPage.message(COMMENTS.requester)).toBeVisible();
    });
  });
});
