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

### Routes (five total)

| Route | Who can see it |
| --- | --- |
| `/login` | Anyone |
| `/my-requests` | Requester (home) |
| `/queue` | Technician + admin (home) |
| `/requests/new` | Requester only |
| `/requests/:id` | The request's owner, or any staff member |

### Domain model

A **request** has a title, description (first message in its activity thread), category (`hardware` / `software` / `facilities` / `access`), priority (`low` / `medium` / `high`), status (`open` / `pending` / `closed` / `cancelled`), a requester, an optional assignee, and timestamps. Status changes follow a fixed lifecycle (see the spec, §4) — `closed` and `cancelled` are terminal, and comments are only allowed while a request is `open` or `pending`.

## Tech stack

- **Vite** — dev server / build tooling
- **React 19 + TypeScript**
- **Tailwind CSS v4** — styling, wired via `@tailwindcss/vite` and imported in `src/index.css`

Routing library, data-fetching layer, and mock API are introduced later in the build (see spec §7/§10) and will be documented here once wired in.

## Project structure

```
src/
  assets/       static assets
  components/   reusable presentational components (e.g. RequestCard)
  data/         fixture data (users, requests, messages) used before the mock API lands
  features/     feature-scoped logic (e.g. requests) — in progress
  hooks/        shared custom hooks
  layouts/      page shell / layout components
  pages/        route-level components
  routes/       route definitions
  services/     API/data-access layer
  shared/
    types/      shared TypeScript types (User, Request, Message)
    constants/  shared constants
    utils/      shared utility functions
  styles/       additional stylesheets
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

## Decisions

Short notes on choices the spec asks us to be able to justify. Filled in as each is built.

- **Styling / theme approach:** Tailwind CSS v4 for utility styling, with theme colors defined as CSS custom properties in `src/index.css` (e.g. `--bg`, `--text`, `--accent`) so components reference tokens instead of one-off hex values. A user-facing light/dark toggle (persisted, on top of `prefers-color-scheme`) is still to be implemented.
- **Large-queue strategy:** not yet implemented (targeted for Day 5 — the queue needs to stay responsive with 500+ requests).
- **Motion rules:** not yet implemented (targeted for Day 4 — a small number of intentional micro-interactions, all disabled under Reduce motion / `prefers-reduced-motion`).

## Status

This is a work in progress, built incrementally per the spec's day-by-day plan (§10). Routing, the full request lifecycle, auth/roles, and the mock API are being added in later stages — see the spec for the full roadmap. No rewrites: each day extends the same repo.

## Out of scope

Per the spec (§8): realtime/websockets, file attachments, rich text editing, threaded replies, email/Slack integration, an "on behalf of" requester picker, a notifications center, SLA timers/analytics, drag-and-drop boards, SSO/OAuth/JWT, global state libraries, and third-party UI kits.
