# Test Plan — Deskline UI Automation

## 1. Scope

**In scope.** Browser-driven end-to-end tests against the Deskline React SPA, covering
authentication, role-based access, the request creation flow, and the staff triage
lifecycle.

**Out of scope.**

| Excluded | Reason |
|---|---|
| Deskline API-level tests | There is no server. The "API" is Mock Service Worker running inside the browser (`src/mocks/handlers.ts`). There is no endpoint a test runner can address over HTTP. |
| Filter / search logic | Already unit-tested in `tests/filterRequests.test.ts` and `tests/filterByAssignee.test.ts`. `filterRequests` is a pure function; re-covering it through a browser is slow and duplicative. UI-02 already proves the filter is wired to the page. |
| Visual / layout regression | Not automatable with meaningful assertions at this level, and not requested. |
| `DELETE /api/requests/:id` | The handler exists but no UI surface calls it. Nothing to drive. |

## 2. System under test

Single-page React 19 app, React Router 7, backed entirely by MSW.

```
Browser
  |-- React SPA (Vite dev server, :5173)
  +-- MSW service worker  --> in-memory db (src/mocks/db.ts)
```

### 2.1 Test accounts

All three seed users share the password `password123` (`src/mocks/credentials.ts`).

| Email | Role | Lands on after login |
|---|---|---|
| `john.doe@example.com` | requester | `/my-requests` |
| `jane.smith@example.com` | technician | `/queue` |
| `bob.johnson@example.com` | admin | `/queue` |

### 2.2 Stable fixture data

`src/mocks/db.ts` seeds 503 requests: three hand-written fixtures plus 500 generated ones.

**The 500 generated requests are randomised on every page load** — `generateRequests`
uses `Math.random()` for status, priority, category and assignee, and
`crypto.randomUUID()` for the id. No test may depend on any of them.

Only these three are deterministic:

| id | title | status | priority | category | requester | assignee |
|---|---|---|---|---|---|---|
| `r1` | Laptop won't boot | open | high | hardware | u1 John Doe | *Unassigned* |
| `r2` | VPN disconnects frequently | pending | medium | software | u1 John Doe | u2 Jane Smith |
| `r3` | Office air conditioner not working | closed | high | facilities | u1 John Doe | u3 Bob Johnson |

**Title-collision warning.** `filterRequests` matches on `title.includes(search)`, and the
generator's title pool contains the literal strings `"VPN disconnects frequently"` and
`"Office air conditioner not working"` (suffixed `#N`). Searching either matches dozens of
rows. The pool's hardware entry is `"Laptop won't turn on"`, **not** `"Laptop won't boot"` —
so `r1`'s title is the only fixture title that is unique as a substring.

> **Rule: anchor deterministic assertions on `r1`, and prefer navigating straight to
> `/requests/r1` over clicking through a list of 503 rows.**

## 3. Environment constraints

These four properties of the app dictate how the tests must be written.

### 3.1 Mocking is dev-only

`src/main.tsx` starts MSW behind `if (import.meta.env.DEV)`. A production build has **no
backend at all** and every request hangs.

> Tests must run against `npm run dev` (`http://localhost:5173`). Never against
> `npm run build && npm run preview`.

### 3.2 The database resets on every full page load

`src/mocks/db.ts` is module-scoped and re-seeds when the bundle is re-imported.

- **Benefit:** perfect test isolation. No fixtures to reset, no teardown, no cleanup. Tests
  can run in parallel without colliding.
- **Cost:** `page.reload()` destroys anything the test created. In-app navigation (clicking
  links, router pushes) preserves it.

> Never reload mid-scenario. Split at a reload boundary into two tests instead.

### 3.3 Session lives in `localStorage`

`src/services/session.ts` stores key `deskline_session` as
`{ user: User, token: "demo-token-<userId>" }`. `AuthProvider` reads it synchronously on
mount, so a pre-seeded value authenticates the app with no UI interaction.

> Drive the login form **only** in UI-01, which is about login. Every other test seeds the
> session directly. This removes roughly 3s and the single largest flake source per test.

### 3.4 Artificial 600 ms latency

`DEMO_LATENCY_MS = 600` in `src/mocks/handlers.ts` delays the GET handlers so loading
states are observable.

> Use web-first auto-retrying assertions exclusively. No `waitForTimeout`, no fixed sleeps.
> Loading states are real and assertable: `role="status"` with "Loading requests...",
> "Loading queue...", "Loading request...".

### 3.5 Known API behaviours worth relying on

Derived from `src/mocks/handlers.ts`:

- `POST /api/requests` does `db.requests.unshift(...)`, so a newly created request appears
  **first** in the list.
- Status transitions enforced server-side: `open -> pending` and `pending -> open` staff
  only; `open -> cancelled` owning requester only; `open|pending -> closed` admin only.
- `assigneeId`: assigning to self requires staff; assigning to anyone else requires admin.
- `POST /api/requests/:id/messages` returns 403 unless the request is `open` or `pending` —
  which is why `RequestDetailPage` posts its system message *before* changing status.
- Role checks are enforced in the handler from `db.users`, not from anything the client
  claims. Hiding a button is not the only gate.

## 4. Tooling

### 4.1 Decision

**Playwright** (`@playwright/test`).

### 4.2 Alternatives considered

| Tool | Verdict |
|---|---|
| **Playwright** | **Chosen.** One framework covers UI and API. First-class `localStorage` seeding via `storageState`, auto-waiting assertions that suit the 600 ms latency, parallel workers that suit the reset-per-load isolation, trace viewer for the live demo. |
| Cypress | Capable, but in-browser execution complicates multi-role scenarios, cross-origin work and parallelism. Its API-testing story is weaker, so the API half would need a second tool. |
| Selenium + WebDriver | Most flexible and most verbose. No built-in auto-waiting, so the 600 ms latency would invite `sleep` calls. No API testing at all. |
| Postman / Newman | Good for the API half only. Would mean two tools, two reports, two commands — against the brief's hint of one tool covering both. |
| Vitest + Testing Library | Already in use for unit tests, and correct for pure functions. Runs in jsdom, not a real browser, so it cannot exercise MSW's service worker, real navigation or real form behaviour. Complementary, not a substitute. |

### 4.3 Runner separation

`vitest.config.ts` declares no `test.include`, so Vitest falls back to its default
`**/*.{test,spec}.?(c|m)[jt]s?(x)` and **will try to execute Playwright specs and crash**.

Prerequisite before any spec is written:

- Playwright specs live in `e2e/`, named `*.spec.ts`.
- `vitest.config.ts` gains `test.include: ["tests/**/*.test.ts"]`.
- `playwright.config.ts` sets `testDir: "./e2e"`.

## 5. Selector strategy

Role- and label-based locators by default; `id` selectors where the app already provides
one; `data-testid` only where neither is sufficient.

The app is better instrumented than expected — every form control already has an `id`:

| Surface | Available selectors |
|---|---|
| Login | `#email`, `#password`, button "Sign In", `role="alert"` |
| Filters | `#filter-search`, `#filter-status`, `#filter-priority`, `#filter-category`, `#filter-assignee` |
| New request | `#title`, `#description`, `#category`, `#priority`, button "Create request" |
| Request detail | `#comment`, `#reassign-select`, buttons "Set Pending" / "Reopen" / "Assign to me" / "Reassign" / "Close request" / "Cancel request" |
| Confirm dialog | `role="alertdialog"`, `#confirm-dialog-title` |
| Loading | `role="status"` |
| Errors | `role="alert"` (both inline form errors and `ErrorState`) |

### 5.1 One requested source change — pending approval

`RequestCard` renders a `<Link>` wrapping a `<Card>` with no test hook, so "exactly one
result" assertions have to count anonymous links and would also match nav links.

Proposed: add `data-testid="request-card"` to the `<Link>` in
`src/features/requests/components/RequestCard.tsx`. One attribute, one file, no behaviour
change.

**Not yet applied.** Fallback if it is rejected: locate rows by their heading role within
the list container, which is workable but more brittle.

## 6. Reporting and execution

| Item | Choice |
|---|---|
| Local run | `npx playwright test` |
| Web server | Playwright's `webServer` config starts `npm run dev` automatically |
| Browsers | Chromium for the demo; Firefox/WebKit optional |
| Reporter | `html` + `list`; `trace: "on-first-retry"` |
| Retries | `0` locally. A test that needs a retry to pass is a test to fix — the Task 2 bar is a clean live run. |
| CI | Not requested. Flag as an open question at review. |

## 7. Open questions for the review

1. `data-testid="request-card"` — approved, or must the tests stay non-invasive?
2. Is Deskline intended to stay MSW-backed, or is a real backend coming? It changes whether
   Deskline can ever have API-level tests.
3. Should the test code live in this repo or a separate one?
4. Is CI expected, or is a local live run sufficient?
