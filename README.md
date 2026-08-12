# Deskline

An internal IT/facilities request desk. Employees ("requesters") file requests and track them to resolution; a small support team of technicians and admins works those requests through a shared queue.

Built incrementally over a two-week internship project, per the spec in [`DESKLINE-INTERN-SPEC.md`](./DESKLINE-INTERN-SPEC.md).

## Overview

- **Requesters** log in, create requests, track their own requests, comment on them, and can cancel a request while it's still open.
- **Technicians** work the shared queue: view all requests, comment, move a request to pending, and assign it to themselves.
- **Admins** can do everything a technician can, plus reassign requests to other staff and close them.

### Roles at a glance

| Role | Lands on | Can do |
| --- | --- | --- |
| `requester` | My requests | Create; view/comment on own requests; cancel own open request |
| `technician` | Queue | View all; comment; set pending; assign to self |
| `admin` | Queue | Everything a technician can, plus reassign and close |

### Demo accounts

Shown on the login screen itself as well. All seed users share the same password.

| Role | Email | Password |
| --- | --- | --- |
| Requester | john.doe@example.com | password123 |
| Technician | jane.smith@example.com | password123 |
| Admin | bob.johnson@example.com | password123 |

### Routes (five total)

| Route | Who can see it |
| --- | --- |
| `/login` | Anyone |
| `/my-requests` | Requester (home) |
| `/queue` | Technician + admin (home) |
| `/requests/new` | Requester only |
| `/requests/:id` | The request's owner, or any staff member |

Enforced two ways: `ProtectedRoute` sends anyone without a session to `/login`; `RoleRoute` sends a logged-in user of the wrong role to their own home route (`getHomeRoute(role)`) rather than showing a blocked screen. Neither is just cosmetic — the mock API independently checks the same rules server-side (see **Auth & role enforcement** below), so hiding a nav link is a UX nicety here, not the actual security boundary.

### Domain model

A **request** has a title, description (first message in its activity thread), category (`hardware` / `software` / `facilities` / `access`), priority (`low` / `medium` / `high`), status (`open` / `pending` / `closed` / `cancelled`), a requester, an optional assignee, and timestamps. Status changes follow a fixed lifecycle (see the spec, §4) — `closed` and `cancelled` are terminal, and comments are only allowed while a request is `open` or `pending`.

## Tech stack

- **Vite** — dev server / build tooling
- **React 19 + TypeScript**
- **Tailwind CSS v4** — styling, wired via `@tailwindcss/vite` and imported in `src/index.css`; also used for its built-in container queries (see **Layout & filter responsiveness** below)
- **react-router-dom** — client-side routing for the five spec routes, route guards (`ProtectedRoute`, `RoleRoute`), and `useSearchParams` for URL-persisted filters
- **MSW (Mock Service Worker)** — the mock REST API (see **Mock API** below)
- **lucide-react** — icon set (nav, category icons, status/action icons)
- **@fontsource-variable/inter** — self-hosted Inter font, no external font request at runtime

## Mock API

`src/mocks/` intercepts `fetch` at the network level via a MSW service worker, started in `main.tsx` before the app renders (`DEV`-only). This was picked over json-server/Mirage because MSW makes `fetch` behave exactly like it would against a real server — the app never knows it isn't talking to one — while still letting the mock enforce real auth/role rules in the handler code, which a static JSON file can't do on its own.

- `mocks/db.ts` — the in-memory "database". Seeded from the 3 hand-written fixtures in `src/data/` plus 500 generated requests (`mocks/generateRequests.ts`), stored in the API's wire shape (`snake_case` timestamps) rather than the UI shape, so the request/response cycle actually exercises the UI↔API mapping in `services/*.ts` instead of the two shapes coincidentally matching.
- `mocks/handlers.ts` — one handler per endpoint in the spec's contract (`POST /login`, `GET/POST /requests`, `PATCH /requests/:id`, `GET/POST /requests/:id/messages`, `GET /users`). Every mutating endpoint re-derives "who is calling" from the `Authorization: Bearer <token>` header (`services/api.ts` attaches it from the stored session) and looks the user up server-side — never trusts a role the client claims — then checks the same status-lifecycle and action rules from spec §5 before allowing the change. Anything not allowed returns `403`, independent of what the UI happens to show or hide.

### Auth & role enforcement

Login (`authService.login`) posts to the mock, stores `{ user, token }` in `localStorage` (`services/session.ts`), and `AuthContext` exposes it as `useAuth()`. Every subsequent request carries that token; the server-side handler is the actual authority on what a role can do — the UI hiding a button is just to avoid showing a control that would immediately 403. This directly targets the spec's Day 6 point: *"Hiding a button is not security."*

## Project structure

```
src/
  assets/       static assets
  components/   reusable presentational components (Badge, Button, Card, ConfirmDialog, Avatar)
  data/         hand-written fixture data (3 users, 3 requests, 3 messages) - seeds the mock API
  features/
    auth/       AuthContext, useAuth, ProtectedRoute, RoleRoute, getHomeRoute
    requests/   list/filter components, useRequestFilters, filterRequests, filterByAssignee, getCategoryIcon
  hooks/        shared custom hooks (useTheme, useReducedMotion)
  layouts/      AppLayout - the app shell (nav, theme/motion toggles, user info, logout)
  mocks/        MSW handlers, in-memory db, seed-data generation, demo credentials
  pages/        route-level components
  routes/       route definitions + guards
  services/     API client (`api.ts`), per-resource services, UI<->API type mapping, session storage, ApiError
  shared/
    types/      shared TypeScript types (User, Request, Message)
    utils/      shared utility functions (cn)
```

## Running the app

Requires Node.js (LTS) and npm.

```bash
# install dependencies
npm install

# start the dev server (http://localhost:5173)
npm run dev

# type-check + production build
npm run build

# preview the production build locally
npm run preview

# lint
npm run lint
```

The dev server starts the MSW worker automatically (`import.meta.env.DEV` check in `main.tsx`) - no separate mock-server process to run.

## Decisions

Short notes on choices the spec asks us to be able to justify.

- **Styling / theme approach:** Tailwind CSS v4 for utility styling, with theme colors defined as CSS custom properties in `src/index.css` (e.g. `--color-background`, `--color-text`, `--color-primary`) so components reference tokens instead of one-off hex values. A `useTheme` hook toggles a `.dark` class on `<html>` and persists the choice to `localStorage`; the toggle lives in `AppLayout` so every signed-in screen gets it for free.

- **Mock API choice (MSW):** picked over json-server/Mirage specifically because the spec calls out that 403s aren't free with json-server, and Deskline's whole Day 6 story is about those 403s being real. MSW handlers are plain functions, so the same role/lifecycle logic in `RoleRoute`/component-level checks can be re-asserted server-side in `handlers.ts` with no special framework support needed.

- **Large-queue strategy:** the mock API is seeded with 503 requests (3 hand-written fixtures + 500 generated by `mocks/generateRequests.ts`, picked from realistic per-category title templates so search/filter demos still return sensible matches). Filtering/searching is done client-side with a single `Array.filter()` pass (`filterRequests.ts`) over the already-fetched list — at ~500 items this is sub-millisecond, so it isn't the bottleneck. The request list itself is **not virtualized**: each `RequestCard` is a small number of DOM nodes, and React's key-based reconciliation keeps re-renders on filter/search changes cheap at this scale — confirmed by testing in the browser (DevTools Network tab shows one `/requests` fetch on load, no repeated fetches while typing). If the dataset grew an order of magnitude larger, the next step would be list virtualization (`@tanstack/react-virtual`) or server-side filtering/pagination.

- **Motion rules:** a `useReducedMotion` hook combines two signals — the user's explicit toggle (persisted to `localStorage`, in `AppLayout`) and the live OS `prefers-reduced-motion` setting (via `matchMedia`, re-checked on change). Motion is reduced if **either** is true — a user can force motion off even if their OS doesn't ask for it, but can't force motion back on against an OS accessibility setting. When active, a `.reduce-motion` class (plus a `@media (prefers-reduced-motion: reduce)` fallback) collapses all CSS animation/transition durations to near-zero globally, so no component needs its own opt-out logic.

- **Layout & filter responsiveness:** the app shell (`AppLayout`) uses a "full-bleed bar, constrained inner content" pattern — `<header>`/`<footer>` span the full window width (so their border/background reach the edges, the normal look for a header/footer bar), but each wraps an inner `mx-auto max-w-6xl` div that matches `<main>` exactly, so the logo, nav, and button group always line up with the page content below regardless of viewport width. `<main>` also reserves scrollbar space with `scrollbar-gutter: stable`, since it (not the whole page) is the scrolling container — without that, the body's width would shift by the scrollbar's ~15px depending on whether a given page's content was tall enough to scroll, breaking alignment with the never-scrolling header/footer. The filter row (`RequestFilters`) uses Tailwind v4 **container queries** (`@container` / `@lg:` / `@4xl:`) rather than viewport breakpoints for its column count, so the number of filters shown per row is driven by the actual rendered width of the filter box itself — correct regardless of window size, an open DevTools panel, etc., which plain `md:`/`xl:` viewport breakpoints can't guarantee.

## Known gaps

Honest status, not just what's done:

- `Badge` variant colors (`components/ui/Badge/badgeVariants.ts`) are still raw Tailwind palette classes (e.g. `bg-green-100 text-green-700`) rather than the `--color-*` token system, with no dark-mode override — badges don't adapt when the theme is switched to dark. Everything else in the app routes through the token system; this is the one remaining exception.
- The `Card` component (`components/ui/Card`) is only used by `RequestCard`; a few other "boxed section" spots (`RequestFilters`, form panels) hand-roll the same visual style with slightly different padding instead of reusing it.

## Out of scope

Per the spec (§8): realtime/websockets, file attachments, rich text editing, threaded replies, email/Slack integration, an "on behalf of" requester picker, a notifications center, SLA timers/analytics, drag-and-drop boards, SSO/OAuth/JWT, global state libraries, and third-party UI kits.
