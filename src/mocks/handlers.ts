import { http, HttpResponse, delay } from "msw";
import { db } from "./db";
import { DEMO_PASSWORD } from "./credentials";

// Intentional artificial latency, demo/testing only - the mock API would
// otherwise resolve near-instantly, making the LoadingState spinner (and
// the reduce-motion on/off difference on it) too brief to actually see or
// reliably test. Remove this once it's served its purpose.
const DEMO_LATENCY_MS = 600;

// Derives "who is calling" from the Authorization header the client attaches
// (see services/api.ts). The role comes from db.users (the mock's own
// "database"), never from anything the client claims directly - a client
// could send any header it wants, so trusting a client-declared role would
// be exactly as fake as hiding a button. This is the enforcement point the
// spec means by "the API must reject anyway."
function getActingUser(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice("Bearer ".length);
  const userId = token.replace("demo-token-", "");

  return db.users.find((candidate) => candidate.id === userId) ?? null;
}

export const handlers = [
  // Log in
  http.post("/api/login", async ({ request }) => {
    const { email, password } = (await request.json()) as {
      email: string;
      password: string;
    };

    const user = db.users.find((candidate) => candidate.email === email);

    if (!user || password !== DEMO_PASSWORD) {
      return new HttpResponse(null, {
        status: 401,
      });
    }

    return HttpResponse.json({
      user,
      token: `demo-token-${user.id}`,
    });
  }),

  // Get all requests (staff see all; requesters see only their own)
  http.get("/api/requests", async ({ request: httpRequest }) => {
    await delay(DEMO_LATENCY_MS);

    const actingUser = getActingUser(httpRequest);

    if (!actingUser) {
      return new HttpResponse(null, {
        status: 401,
      });
    }

    const visibleRequests =
      actingUser.role === "requester"
        ? db.requests.filter((r) => r.requesterId === actingUser.id)
        : db.requests;

    return HttpResponse.json(visibleRequests);
  }),

  // Get a request by id (owner or any staff member; 403 otherwise)
  http.get("/api/requests/:id", async ({ params, request: httpRequest }) => {
    await delay(DEMO_LATENCY_MS);

    const actingUser = getActingUser(httpRequest);

    if (!actingUser) {
      return new HttpResponse(null, {
        status: 401,
      });
    }

    const existingRequest = db.requests.find(
      (r) => r.id === params.id
    );

    if (!existingRequest) {
      return new HttpResponse(null, {
        status: 404,
      });
    }

    const isOwner = existingRequest.requesterId === actingUser.id;
    const isStaff = actingUser.role === "technician" || actingUser.role === "admin";

    if (!isOwner && !isStaff) {
      return new HttpResponse(null, {
        status: 403,
      });
    }

    return HttpResponse.json(existingRequest);
  }),

  // Create a new request (requester only; requesterId must be the caller - no "on behalf of" via the API)
http.post("/api/requests", async ({ request: httpRequest }) => {
  const actingUser = getActingUser(httpRequest);

  if (!actingUser) {
    return new HttpResponse(null, { status: 401 });
  }

  if (actingUser.role !== "requester") {
    return new HttpResponse(null, { status: 403 });
  }

  const newRequest = await httpRequest.json() as (typeof db.requests)[number];

  if (newRequest.requesterId !== actingUser.id) {
    return new HttpResponse(null, { status: 403 });
  }

  db.requests.unshift(newRequest);

  return HttpResponse.json(newRequest, {
    status: 201,
  });
}),

// Update a request (status and/or assignee only; must obey the status
// lifecycle and action rules - anything else, or an invalid transition, 403)
http.patch("/api/requests/:id", async ({ params, request: httpRequest }) => {
  const actingUser = getActingUser(httpRequest);

  if (!actingUser) {
    return new HttpResponse(null, { status: 401 });
  }

  const existingRequest = db.requests.find(
    (r) => r.id === params.id
  );

  if (!existingRequest) {
    return new HttpResponse(null, {
      status: 404,
    });
  }

  const updates = await httpRequest.json() as Partial<(typeof db.requests)[number]>;

  const allowedKeys = new Set(["status", "assigneeId"]);
  const hasDisallowedField = Object.keys(updates).some((key) => !allowedKeys.has(key));

  if (hasDisallowedField) {
    return new HttpResponse(null, { status: 403 });
  }

  const isOwner = existingRequest.requesterId === actingUser.id;
  const isStaff = actingUser.role === "technician" || actingUser.role === "admin";

  if (updates.status !== undefined) {
    const isValidTransition =
      (updates.status === "pending" && isStaff && existingRequest.status === "open") ||
      (updates.status === "open" && isStaff && existingRequest.status === "pending") ||
      (updates.status === "cancelled" && actingUser.role === "requester" && isOwner && existingRequest.status === "open") ||
      (updates.status === "closed" && actingUser.role === "admin" && (existingRequest.status === "open" || existingRequest.status === "pending"));

    if (!isValidTransition) {
      return new HttpResponse(null, { status: 403 });
    }
  }

  if (updates.assigneeId !== undefined) {
    const assigningToSelf = updates.assigneeId === actingUser.id;
    const canAssign = assigningToSelf ? isStaff : actingUser.role === "admin";

    if (!canAssign) {
      return new HttpResponse(null, { status: 403 });
    }
  }

  Object.assign(existingRequest, updates, {
    updated_at: new Date().toISOString(),
  });

  return HttpResponse.json(existingRequest);
}),

// Delete a request
http.delete("/api/requests/:id", ({ params }) => {
  const index = db.requests.findIndex(
    (request) => request.id === params.id
  );

  if (index === -1) {
    return new HttpResponse(null, {
      status: 404,
    });
  }

  db.requests.splice(index, 1);

  return new HttpResponse(null, {
    status: 204,
  });
}),

// Get all messages for a request
http.get("/api/requests/:id/messages", ({ params }) => {
  const messages = db.messages.filter(
    (message) => message.requestId === params.id
  );

  return HttpResponse.json(messages);
}),


// Create a message (owner or any staff member; only while open/pending;
// authorId must be the caller - no posting as someone else)
http.post("/api/requests/:id/messages", async ({ params, request: httpRequest }) => {
  const actingUser = getActingUser(httpRequest);

  if (!actingUser) {
    return new HttpResponse(null, { status: 401 });
  }

  const existingRequest = db.requests.find((r) => r.id === params.id);

  if (!existingRequest) {
    return new HttpResponse(null, { status: 404 });
  }

  const isOwner = existingRequest.requesterId === actingUser.id;
  const isStaff = actingUser.role === "technician" || actingUser.role === "admin";
  const canComment =
    (isOwner || isStaff) &&
    (existingRequest.status === "open" || existingRequest.status === "pending");

  if (!canComment) {
    return new HttpResponse(null, { status: 403 });
  }

  const newMessage = await httpRequest.json() as (typeof db.messages)[number];

  if (newMessage.authorId !== actingUser.id) {
    return new HttpResponse(null, { status: 403 });
  }

  db.messages.push(newMessage);

  return HttpResponse.json(newMessage, {
    status: 201,
  });
}),

// Get all users
http.get("/api/users", () => {
  return HttpResponse.json(db.users);
}),

// Get user by id
http.get("/api/users/:id", ({ params }) => {
  const user = db.users.find(
    (user) => user.id === params.id
  );

  if (!user) {
    return new HttpResponse(null, {
      status: 404,
    });
  }

  return HttpResponse.json(user);
}),


];