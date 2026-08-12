# Deskline — Your Project Spec

Welcome. Over the next two weeks you will build **Deskline**, an internal IT/facilities request desk, from an empty repo to a working, demo-able app.

This document is your spec. It tells you **what** to build and the **rules** the app must follow. It does not tell you exactly how to write the code — that is your job, and it is what you will be assessed on. When in doubt, prefer the smallest thing that satisfies the spec.

---

## How you work (ground rules)

- **Stack:** Build on the provided **Vite + React + TypeScript** starter. Use TypeScript throughout.
- **One Git repo, committed as you go.** Maintain your own Git repository from Day 1. Commit in small, meaningful steps — aim for several commits per session, not one giant commit at the end — and push before each mentored session so your mentor can see your progress and history.
- **It grows incrementally.** Each day extends the same repo. No rewrites.
- **Keep a README** with how to run the app plus short notes on the decisions you were asked to justify (styling/theme approach, large-queue strategy, motion rules).

---

## 1. What you are building

Employees ("requesters") file IT/facilities requests and track them. A small support team ("technicians" and "admins") works those requests in a shared queue.

- A **requester** logs in, creates a request, tracks it, comments on it, and can cancel it while it is still open.
- A **technician** works the queue: comments, moves a request to pending, and assigns it to themselves.
- An **admin** can do everything a technician can, plus reassign requests and close them.

Keep the product small and believable. If a feature is not in this spec, it is out of scope.

---

## 2. Roles

| Role | Where they land after login | What they can do |
| --- | --- | --- |
| `requester` | My requests | Create; view/comment on **own** requests; cancel own open request |
| `technician` | Queue | View all; comment; set pending; assign to self |
| `admin` | Queue | Everything a technician can, plus reassign and close |

---

## 3. Routes

Your app has exactly these five routes. Do not add more.

| Route | Who can see it |
| --- | --- |
| `/login` | Anyone |
| `/my-requests` | Requester (their home). Staff visiting here get redirected to `/queue`. |
| `/queue` | Technician + admin (their home). Requesters are redirected / blocked. |
| `/requests/new` | Requester only |
| `/requests/:id` | The request's owner, or any staff member |

---

## 4. The domain

### A request has

- Title
- Description (this becomes the **first message** in the activity thread)
- Category — one of: `hardware`, `software`, `facilities`, `access`
- Priority — one of: `low`, `medium`, `high`
- Status — one of: `open`, `pending`, `closed`, `cancelled`
- A requester (who created it)
- An assignee (a staff member, or nobody)
- Created / updated timestamps

`category` and `priority` are chosen **when the request is created** and are **not editable** afterwards in this MVP.

### Messages

- A request has a flat, chronological list of messages. **No nested/threaded replies.**
- The description is the first message.
- Cancelling or closing may add a system message (e.g. "Cancelled by requester").

### Status lifecycle

These are the only valid status changes — nothing else:

| From | To | Who |
| --- | --- | --- |
| `open` | `pending` | Technician or admin |
| `pending` | `open` | Technician or admin |
| `open` | `cancelled` | Requester (own request) |
| `open` or `pending` | `closed` | Admin |

- `closed` and `cancelled` are **terminal** — there is no reopening in this MVP.
- You can only add comments while a request is `open` or `pending`. Once it is `closed` or `cancelled`, the thread is **read-only** (no comment box).

### People and names

The detail header shows the requester's and assignee's **names** (not their ids), and the admin **reassign** control needs a list of staff to choose from. Plan for this: either fetch users from `GET /users` or include the needed user summary with each request. Do not hard-code names inside components.

### Suggested TypeScript shapes

```ts
type Status = "open" | "pending" | "closed" | "cancelled";
type Priority = "low" | "medium" | "high";
type Category = "hardware" | "software" | "facilities" | "access";

type User = {
  id: string;
  name: string;
  email: string;
  role: "requester" | "technician" | "admin";
};

type Message = {
  id: string;
  requestId: string;
  authorId: string;
  body: string;
  createdAt: string;
};

type Request = {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  category: Category;
  requesterId: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
};
```

---

## 5. What each role can do (action rules)

These rules are the heart of the app. The **UI must hide** actions a user cannot perform, and the **API must reject** them anyway (return 403). Hiding a button is not security — you will demonstrate why on Day 6.

| Action | Requester | Technician | Admin |
| --- | --- | --- | --- |
| View own request | Yes | — | — |
| View queue / any request | No (403) | Yes | Yes |
| Comment on a request they can see | Yes (own) | Yes | Yes |
| Create a request | Yes | No | No |
| Cancel own **open** request (→ `cancelled`) | Yes (confirm) | No | No |
| Set status → `pending` | No | Yes | Yes |
| Close (→ `closed`) | No | No (hidden; API 403) | Yes (confirm) |
| Reassign to someone else | No | No (hidden; API 403) | Yes |
| Assign to me | No | Yes | Yes |

Notes:

- A requester can only cancel while the request is **open**.
- Close and Cancel both require a **confirmation dialog** before they take effect.
- The `—` for technician/admin on "view own request" only means it is already covered by "view queue / any request" — staff can see every request.
- Which status changes are legal is defined in **Status lifecycle** above.

---

## 6. Screens and required states

### App shell (every signed-in screen)

- A **light / dark** appearance control. The choice must survive a reload.
- A **Reduce motion** control. When it is on, non-essential motion in the app is turned off or made instantaneous. Also respect the OS setting `prefers-reduced-motion` (document how your toggle interacts with it).
- Theme colors should come from **CSS custom properties** (or an equivalent token approach) so screens do not hard-code one-off light/dark values.
- A **log out** control that clears the session and returns to `/login`. You will use this constantly to switch between the demo accounts.

### Login

- Email + password form.
- Show validation errors (empty/invalid fields) and an auth error (wrong credentials).
- You define the **seed users** — at least one `requester`, one `technician`, and one `admin`. Surface their credentials on the login screen (demo hints) so anyone can sign in as each role.

### My requests (requester) and Queue (staff)

- A filterable, searchable list of requests.
- Filters: **status** (Open / Pending / Closed / Cancelled / All), **priority**, **category**, and **title search**.
- Queue also has an **assignee** filter: All / Unassigned / Me.
- The **status filter must persist in the URL** (a search param), so refreshing or sharing the link keeps the filter.
- Title search is **case-insensitive substring** matching on the title (e.g. "vpn" matches "VPN drops on Wi-Fi").
- Status, priority, and category must be visible on each row **and** again on the request detail header — they should look and behave the same in both places.
- My requests and Queue should feel like the same product: same list layout language, same filter/search patterns (Queue simply adds assignee).
- Required states: **loading**, **empty** (you have no requests / the queue is empty), **no matches** (filters/search return nothing — this is a *different* message from true empty), and **error + Retry**.

### Queue scale

- The staff queue is not a toy list. Your data (fixtures or mock API) must include on the order of **500+** requests for the Queue.
- Filtering, searching, and scrolling the Queue must stay usable — no multi-second freezes, no browser lockups. How you achieve that is your decision; write a short note in the README explaining what you did and why.
- Rough target on a normal laptop: the Queue's first render feels near-instant, and typing in search or changing a filter updates the list within about **100 ms**. If interactions feel sluggish or the tab locks up, that is a bug to fix.

### Request detail

- Header with title, status, priority, category, requester **name**, and assignee **name** (or "Unassigned").
- The flat message list.
- A comment box (single field + submit) **while the request is `open` or `pending`**. **Disable submit while sending** so a double-click cannot post twice. When the request is `closed`/`cancelled`, the thread is read-only (no comment box).
- Role-appropriate actions (see the action rules). Cancel and Close both need a **confirmation** step before they take effect — treat them as the same kind of interaction. Admin **reassign** picks from the staff list (`GET /users`).
- Required states: loading, error + Retry, comment submitting, cancel/close confirming.

### Create request (requester)

- Fields: title, description, category, priority.
- Inline validation; submit is blocked while the form is invalid.
- On success, the new request exists with the description as its first message.

### Motion

- Add a small number of **intentional** micro-interactions (roughly 2–3) that give feedback — for example dialog open/close, a status change, or a control showing it is busy.
- Motion must not be required to use the app. With **Reduce motion** on (or OS preference set), those flourishes are off or reduced to an instant change.

---

## 7. Data / API

From Day 5, your app must talk to a **mock REST API** that matches the contract below. You set up the mock yourself (mentors can help). You are **not** building a real production backend.

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/login` | Return the user + a fake token |
| `GET` | `/users` | List users — for showing names and the admin reassign picker (staff only) |
| `GET` | `/requests` | List (staff see all; requesters see only their own) |
| `GET` | `/requests/:id` | One request + its messages |
| `POST` | `/requests` | Create a request (+ first message) |
| `POST` | `/requests/:id/messages` | Add a comment (only while `open`/`pending`) |
| `PATCH` | `/requests/:id` | Change status and/or assignee (must obey the Status lifecycle and action rules; forbidden changes return 403) |

If you would rather embed a small `requester`/`assignee` summary on each request instead of calling `GET /users` for names, that is fine — but the admin reassign picker still needs the list of staff from somewhere.

### Suggested tools for mocking data

Choose **one**. Be ready to explain why you picked it.

| Tool | Good when… | Watch out for… |
| --- | --- | --- |
| **[MSW](https://mswjs.io/)** (Mock Service Worker) | You want `fetch` to behave like a real network call inside the browser | Slightly more setup; learn the handler mental model |
| **[json-server](https://github.com/typicode/json-server)** | You want a quick fake REST API from a JSON file | Role checks / 403s are not free — you may need custom routes |
| **[Mirage JS](https://miragejs.com/)** | You like defining routes + seed data in one place in the app | Another library to understand and justify |
| **Small Express (or similar) stub** | You need precise control over status codes and auth rules | Easy to over-engineer; keep it tiny |
| **Fixtures + fake async** (early days only) | Days 1–4 while you focus on UI | Not enough for Day 5 — graduate to a real mock |

Whatever you choose must support the endpoints above and the role rules (including **403** on forbidden actions).

Requirements:

- Every fetch has a **loading**, **success**, **error**, and (where relevant) **empty** state, with a **Retry** on lists and detail.
- Keep your **UI types** separate from your **API types**, and map between them.
- Mutations (create, comment, status/assignee changes) disable their control while in flight.

---

## 8. Out of scope (do not build these)

Realtime / websockets, file attachments, rich text / markdown editor, threaded replies, email or Slack integration, an "on behalf of" requester picker, a notifications center, SLA timers or analytics dashboards, drag-and-drop boards, SSO / OAuth / JWT, global state libraries (e.g. Redux), and dropping in a full UI kit (MUI, Chakra, etc.) to skip building your own controls. If you think you need one of these, ask first — the answer is almost always no.

---

## 9. Stretch goals (only after the day's core work is done)

- TanStack Query (or similar) for list/detail server state
- Optimistic comment (roll back on error)
- Toast notifications for success/error
- Keyboard shortcut (e.g. `/` focuses search)
- Client-side sort (updatedAt or priority)
- Unit tests for your pure filter/search/sort helpers
- A fuller accessibility pass (contrast, focus traps, skip link)

---

## 10. Day-by-day targets

Each mentored session is 2 hours. Between sessions you have ~8–10 hours of independent build time. "Must ship" is due by the **start of the next session**.

| Day | Date | Theme | Must ship by next session |
| --- | --- | --- | --- |
| 1 | Jul 22 | How web apps work | App shell; a small fixture list + static detail; a `Request` type; theme color tokens started; README with run steps |
| 2 | Jul 24 | Components & UI | Badges on list rows; status/priority/category filters + title search; responsive layout; **working light/dark toggle** (persisted) |
| 3 | Jul 27 | Architecture & routing | All five routes wired; `features/requests` + `shared/` structure; status filter in the URL; My requests and Queue share the same list/filter patterns |
| 4 | Jul 30 | UX, forms, a11y | Create form with validation; empty / no-matches / error; confirm-before-cancel; labeled inputs; **2–3 micro-interactions** + **Reduce motion** toggle (and OS preference) |
| 5 | Aug 3 | Data, APIs, state | All flows via the mock API; loading/error/Retry; comment can't double-submit; UI↔API types; **Queue usable with ~500+ requests** (document your approach) |
| 6 | Aug 5 | Auth, roles, trust | Login **and logout**; protected routes; three-role UI; forbidden actions hidden **and** rejected (403) with feedback; queue assignee filter; admin reassign uses the staff list |
| 7 | Aug 7 | Shipping | Checklist; demo of full lifecycle **including theme, reduce motion, and large Queue**; a11y fixes. **No new features.** |

---

## 11. How you'll be assessed

- **You can justify your decisions.** Why this folder structure, why this styling/theme approach, why (or why not) this dependency, how you kept the Queue fast.
- **The unhappy paths work.** Empty, loading, error, no-matches, invalid form, forbidden action — not just the happy path.
- **The UI stays consistent.** The same kinds of controls (badges, filters, confirms, fields) should not feel like they were invented separately on every screen.
- **Roles are enforced, not just hidden.** The 403 story on Day 6 is a key outcome.
- **Motion is optional.** Theme and Reduce motion both work; the app remains fully usable with motion off.
- **The app is incremental.** One repo that grows each day — no rewrites.
- **Use AI as an assistant, not an oracle.** You should be able to explain any code in your project.

Build something you'd be comfortable demoing on Day 7. Good luck.
