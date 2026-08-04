import { http, HttpResponse } from "msw";
import { db } from "./db";

export const handlers = [
  // Get all requests
  http.get("/api/requests", () => {
    return HttpResponse.json(db.requests);
  }),

  // Get a request by id
  http.get("/api/requests/:id", ({ params }) => {
    const request = db.requests.find(
      (request) => request.id === params.id
    );

    if (!request) {
      return new HttpResponse(null, {
        status: 404,
      });
    }

    return HttpResponse.json(request);
  }),

  // Create a new request
http.post("/api/requests", async ({ request }) => {
  const newRequest = await request.json();

  db.requests.unshift(newRequest as (typeof db.requests)[number]);

  return HttpResponse.json(newRequest, {
    status: 201,
  });
}),

// Update a request
http.patch("/api/requests/:id", async ({ params, request }) => {
  const updates = await request.json() as Partial<(typeof db.requests)[number]>;

  const existingRequest = db.requests.find(
    (request) => request.id === params.id
  );

  if (!existingRequest) {
    return new HttpResponse(null, {
      status: 404,
    });
  }

  Object.assign(existingRequest, updates, {
    updatedAt: new Date().toISOString(),
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


// Create a message
http.post("/api/requests/:id/messages", async ({ request }) => {
  const newMessage = await request.json();

  db.messages.push(newMessage as (typeof db.messages)[number]);

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