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
];