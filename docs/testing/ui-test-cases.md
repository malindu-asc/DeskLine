# Deskline — UI End-to-End Test Cases

Three cases, targeting the brief's "2 to 3 UI end-to-end automatable test cases".

Read [test-plan.md](./test-plan.md) first — sections 2.2 (stable fixture data) and 3
(environment constraints) explain why these cases are shaped the way they are.

## Summary

| ID | Case | Priority | Est. runtime | Automated tests |
|---|---|---|---|---|
| [UI-01](#ui-01--authentication-and-role-based-access) | Authentication and role-based access | Critical | ~8s | 6 |
| [UI-02](#ui-02--requester-creates-a-request-and-finds-it) | Requester creates a request and finds it | Critical | ~10s | 1 |
| [UI-03](#ui-03--staff-triage-lifecycle) | Staff triage lifecycle | High | ~12s | 2 |

## Why these three

The brief asks for flows that are *critical and valuable*, not for coverage. Each case was
selected against three questions: what breaks the product if it regresses, what logic is
complex enough to regress silently, and what is not already covered by the existing unit
tests.

| Case | What breaks if it regresses | Why a browser test is the right level |
|---|---|---|
| UI-01 | Nobody can log in, or the wrong role reads another role's data. Total loss of function or a confidentiality failure. | The guards (`ProtectedRoute`, `RoleRoute`) are routing behaviour. They only exist when a real router responds to a real URL. |
| UI-02 | The product's single core transaction stops working. A helpdesk that cannot take a request has no purpose. | Spans form validation, two sequential POSTs, a redirect, a list refetch and a detail render. No unit test crosses those boundaries. |
| UI-03 | Staff cannot triage, or a permission gate opens to the wrong role. | The `canComment` / `canClose` / `canCancel` / `canAssignToMe` matrix in `RequestDetailPage.tsx` is the most conditional logic in the codebase, and it is re-enforced server-side in the PATCH handler. Both layers need exercising together. |

### Considered and rejected

**Queue filter and search.** Attractive on the surface — 503 rows, five filter controls,
URL-persisted state. Rejected: `filterRequests` and `filterByAssignee` are pure functions
already unit-tested in `tests/`, and UI-02 step 9 proves the search box is wired to the
list. Re-testing pure logic through a browser buys near-zero risk reduction for roughly a
third of the suite's runtime.

**Request cancellation by a requester.** Genuinely valuable, and the mirror image of the
admin close path in UI-03b. Held back only because the brief caps the UI at three cases.
First candidate if the cap is lifted.

---

## UI-01 — Authentication and role-based access

| | |
|---|---|
| **ID** | UI-01 |
| **Priority** | Critical |
| **Type** | UI end-to-end, functional + authorization |
| **Automated tests** | 6 |
| **Code under test** | `pages/LoginPage.tsx`, `features/auth/AuthContext.tsx`, `features/auth/components/ProtectedRoute.tsx`, `features/auth/components/RoleRoute.tsx`, `features/auth/utils/getHomeRoute.ts`, `POST /api/login` |

**Preconditions.** Dev server running. `localStorage` empty — this is the only case that
must *not* seed a session, because the login form is the thing under test.

### UI-01.1 — Submit is blocked until the form is valid

| # | Step | Expected result |
|---|---|---|
| 1 | Navigate to `/login` | Heading "DeskLine", subtitle "Sign in to continue" |
| 2 | Observe the "Sign In" button | Disabled |
| 3 | Focus `#email`, then blur it without typing | Inline error "Email is required." |
| 4 | Focus `#password`, then blur it | Inline error "Password is required." |
| 5 | Observe the "Sign In" button | Still disabled |

> Validation errors only render once a field is `touched`, so blur is required — typing
> then clearing will not surface them.

### UI-01.2 — Malformed email is rejected client-side

| # | Step | Expected result |
|---|---|---|
| 1 | Navigate to `/login` |  |
| 2 | Type `not-an-email` into `#email`, then blur | Inline error "Enter a valid email address." |
| 3 | Observe the "Sign In" button | Disabled — no network request is made |

### UI-01.3 — Wrong password is rejected by the API

| # | Step | Expected result |
|---|---|---|
| 1 | Navigate to `/login` |  |
| 2 | Enter `john.doe@example.com` / `wrongpassword` | Button becomes enabled |
| 3 | Click "Sign In" | Button label changes to "Signing in..." |
| 4 | Wait for the response | `role="alert"` reads "Invalid email or password." |
| 5 | Observe the URL | Still `/login` — no navigation occurred |

> Asserts the 401 branch of `POST /api/login` surfaces as a user-visible message rather
> than a silent failure.

### UI-01.4 — Requester signs in and lands on My Requests

| # | Step | Expected result |
|---|---|---|
| 1 | Navigate to `/login` |  |
| 2 | Enter `john.doe@example.com` / `password123`, click "Sign In" |  |
| 3 | Wait for navigation | URL is `/my-requests` |
| 4 | Observe the page | `role="status"` "Loading requests..." appears, then heading "My Requests" |
| 5 | Observe the page | A "New Request" button is present |

### UI-01.5 — Technician signs in and lands on the Queue

| # | Step | Expected result |
|---|---|---|
| 1 | Navigate to `/login` |  |
| 2 | Enter `jane.smith@example.com` / `password123`, click "Sign In" |  |
| 3 | Wait for navigation | URL is `/queue`, heading "Queue" |
| 4 | Observe the filter bar | `#filter-assignee` is present — it renders only on the Queue |

### UI-01.6 — Route guards redirect by role and by session

Data-driven over three rows.

| # | Precondition | Navigate to | Expected result |
|---|---|---|---|
| a | No session | `/my-requests` | Redirected to `/login` |
| b | Requester session seeded | `/queue` | Redirected to `/my-requests` |
| c | Technician session seeded | `/my-requests` | Redirected to `/queue` |

> `RoleRoute` sends a wrong-role user to **their own home route** via `getHomeRoute`, not to
> an "access denied" screen. Verified in `RoleRoute.tsx`.
>
> Rows b and c seed `localStorage` directly — they test the guard, not the login form.

---

## UI-02 — Requester creates a request and finds it

| | |
|---|---|
| **ID** | UI-02 |
| **Priority** | Critical |
| **Type** | UI end-to-end, happy path with negative validation |
| **Automated tests** | 1 (single continuous scenario — the value is in the chain) |
| **Code under test** | `pages/NewRequestPage.tsx`, `pages/MyRequestsPage.tsx`, `pages/RequestDetailPage.tsx`, `services/requestService.ts`, `services/messageService.ts`, `POST /api/requests`, `POST /api/requests/:id/messages` |

**Preconditions.** Requester session (`u1` John Doe) seeded in `localStorage`.

**Test data.** Title must be unique per run to survive the 500 randomised fixtures:
`E2E new request ${Date.now()}`.

| # | Step | Expected result |
|---|---|---|
| 1 | Navigate to `/requests/new` | Heading "New Request", a "Back to My Requests" button |
| 2 | Observe "Create request" | Disabled |
| 3 | Type `AB` into `#title`, blur | "Title must be at least 3 characters." |
| 4 | Type `too short` into `#description`, blur | "Description must be at least 10 characters." |
| 5 | Blur `#category` without selecting | "Please select a category." |
| 6 | Blur `#priority` without selecting | "Please select a priority." |
| 7 | Fill `#title` with the unique title; `#description` with a 10+ char body; select `#category` = Hardware, `#priority` = High | All four inline errors clear; "Create request" becomes enabled |
| 8 | Click "Create request" | Label changes to "Creating...", then URL becomes `/my-requests` |
| 9 | Type the unique title into `#filter-search` | Exactly **one** request card is listed |
| 10 | Assert the card | Title matches; badges read `open`, `high`, `hardware` |
| 11 | Click the card | URL matches `/requests/<uuid>` |
| 12 | Assert the detail header | Heading is the unique title; badges `open` / `high` / `hardware` |
| 13 | Assert the detail metadata | Requester "John Doe"; Assignee "Unassigned" |
| 14 | Assert the Activity thread | Contains exactly one message, authored by "John Doe", body equal to the description entered in step 7 |

### Why step 14 is the assertion that matters

`NewRequestPage` never stores the description on the request. It sends two calls: `POST
/api/requests` for the record, then `POST /api/requests/:id/messages` with the description
as the thread's first message (`NewRequestPage.tsx`, `handleSubmit`). If the second call is
dropped, every earlier assertion still passes and the request silently loses its
description. Step 14 is the only step that catches it.

### Implementation notes

- **Do not `page.reload()` after step 8.** A full load re-seeds the MSW db and the new
  request vanishes. Step 8's redirect is a router push, so the record survives.
- `POST /api/requests` uses `unshift`, so the new card is also first in the unfiltered
  list. Step 9 filters anyway — an order-independent assertion is worth more than one that
  depends on insertion order.
- `#title` and `#priority` collide by `id` with `#filter-search`'s siblings on other pages
  but not on this one; scope locators to the form if that changes.

---

## UI-03 — Staff triage lifecycle

| | |
|---|---|
| **ID** | UI-03 |
| **Priority** | High |
| **Type** | UI end-to-end, state machine + authorization matrix |
| **Automated tests** | 2 |
| **Code under test** | `pages/RequestDetailPage.tsx`, `components/ui/ConfirmDialog.tsx`, `PATCH /api/requests/:id`, `POST /api/requests/:id/messages` |

**Preconditions.** Anchored on fixture `r1` — open, high, hardware, unassigned, requested
by `u1`. Navigate directly to `/requests/r1`.

**Why two tests.** The scenario needs a technician and then an admin. Switching session
requires a full page load, which re-seeds the db and resets `r1` to `open` / unassigned.
Rather than fight that, each test starts from a clean `r1` and asserts its own role's slice
of the matrix.

### UI-03a — Technician assigns and sets pending, then comments

**Precondition.** Technician session (`u2` Jane Smith) seeded.

| # | Step | Expected result |
|---|---|---|
| 1 | Navigate to `/requests/r1` | `role="status"` "Loading request...", then heading "Laptop won't boot" |
| 2 | Assert the badges | `open`, `high`, `hardware` |
| 3 | Assert metadata | Requester "John Doe"; Assignee "Unassigned" |
| 4 | Assert the Actions block | "Set Pending" and "Assign to me" are visible; **"Close request" and "Cancel request" are not** |
| 5 | Click "Assign to me" | Assignee becomes "Jane Smith"; "Assign to me" disappears |
| 6 | Click "Set Pending" | Status badge becomes `pending`; "Set Pending" is replaced by "Reopen" |
| 7 | Assert the comment box | `#comment` is still present — `pending` is a commentable status |
| 8 | Type `Investigating the boot failure.` into `#comment` | "Send" becomes enabled |
| 9 | Click "Send" | Label changes to "Sending...", then the Activity thread gains a message authored by "Jane Smith" with that body; `#comment` is cleared |
| 10 | Click "Reopen" | Status badge returns to `open`; "Set Pending" returns |

Step 4's negative assertions are the authorization half of the case: a technician is not an
admin, and the `canClose` / `canCancel` flags must keep those buttons off the page. The
PATCH handler would reject the call with a 403 anyway — asserting both means a regression in
either layer is visible.

### UI-03b — Admin closes a request, and the thread becomes read-only

**Precondition.** Admin session (`u3` Bob Johnson) seeded. Fresh load, so `r1` is `open`
and unassigned again.

| # | Step | Expected result |
|---|---|---|
| 1 | Navigate to `/requests/r1` | Heading "Laptop won't boot", badge `open` |
| 2 | Assert the Actions block | "Close request", "Set Pending", "Assign to me", "Reassign" and `#reassign-select` all visible; "Cancel request" is **not** (requester-only) |
| 3 | Click "Close request" | A `role="alertdialog"` opens, titled "Close this request?" |
| 4 | Click "Keep request" | Dialog closes; status badge is still `open` — nothing was mutated |
| 5 | Click "Close request" again, then "Close request" in the dialog | Confirm label reads "Closing...", then the dialog closes |
| 6 | Assert the status badge | `closed` |
| 7 | Assert the comment box | `#comment` is **gone**; the text "This request is closed - the thread is read-only." is shown instead |
| 8 | Assert the Actions block | The whole "Actions" section is gone — `hasAnyAction` is false for a closed request |
| 9 | Assert the Activity thread | Contains a message authored by "Bob Johnson" with body "Closed by admin" |

Step 4 is the step most suites skip. A confirm dialog whose cancel path silently mutates is
a real class of bug, and it is invisible unless something asserts the negative.

Step 9 covers an ordering constraint in the app: `POST /api/requests/:id/messages` returns
403 once a request is no longer `open` or `pending`, so `handleCloseConfirm` must post the
system message *before* the status PATCH. If that order is ever swapped, the close still
appears to succeed and only the audit message is lost.

---

## Traceability

| Requirement / behaviour | Covered by |
|---|---|
| Login with valid credentials | UI-01.4, UI-01.5 |
| Login rejects bad credentials | UI-01.3 |
| Client-side login validation | UI-01.1, UI-01.2 |
| Unauthenticated users cannot reach protected routes | UI-01.6a |
| Role-based route restriction | UI-01.6b, UI-01.6c |
| Role-based landing page | UI-01.4, UI-01.5 |
| Create a request | UI-02 |
| Client-side request validation | UI-02 steps 3-6 |
| Description persists as the first thread message | UI-02 step 14 |
| Search filters the list | UI-02 step 9 |
| Request detail renders record and thread | UI-02 steps 12-14, UI-03a step 1 |
| Assign to self | UI-03a step 5 |
| `open -> pending` transition | UI-03a step 6 |
| `pending -> open` transition | UI-03a step 10 |
| `open -> closed` transition (admin) | UI-03b step 5 |
| Post a comment | UI-03a step 9 |
| Closed threads are read-only | UI-03b step 7 |
| Action visibility per role | UI-03a step 4, UI-03b step 2 |
| Destructive actions require confirmation | UI-03b steps 3-5 |
| Cancelling a confirm dialog mutates nothing | UI-03b step 4 |
| Loading states render | UI-01.4 step 4, UI-03a step 1 |
| `open -> cancelled` transition (requester) | **Not covered** — see "Considered and rejected" |
| Queue assignee filter | **Not covered** — unit-tested in `tests/filterByAssignee.test.ts` |
| `ErrorState` retry path | **Not covered** — needs request interception to force a failure; propose for a later iteration |

## Planned file layout

```
e2e/
  fixtures/
    auth.ts          seedSession(page, role) -> writes deskline_session
    users.ts         the three seed users and their tokens
    requests.ts      the r1 / r2 / r3 fixture constants
  auth.spec.ts       UI-01
  create-request.spec.ts  UI-02
  triage.spec.ts     UI-03a, UI-03b
```

## Prerequisites before implementation

1. Restrict `vitest.config.ts` to `tests/**/*.test.ts` so Vitest stops matching Playwright
   specs. See test-plan.md section 4.3.
2. Decide on `data-testid="request-card"`. See test-plan.md section 5.1. UI-02 step 9's
   "exactly one card" assertion is cleaner with it.
3. Install Playwright and add `playwright.config.ts` with `testDir: "./e2e"` and a
   `webServer` entry running `npm run dev`.
