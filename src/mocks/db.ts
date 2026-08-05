import { requests, users, messages } from "../data";
import { generateRequests } from "./generateRequests";

// The 3 hand-written fixtures stay small and readable for demo purposes;
// bulk synthetic data is generated separately so the Queue has a
// realistic (500+) volume without the fixture file being unreadable.
const allRequests = [...requests, ...generateRequests(500, "u1")];

// The mock "server" stores data in the wire (API) shape — snake_case
// timestamps — so the request/response cycle actually exercises the
// UI <-> API mapping in services/*.ts, instead of the two shapes
// coincidentally matching because both come from the same fixtures.
function toApiRequest(request: (typeof requests)[number]) {
  const { createdAt, updatedAt, ...rest } = request;

  return {
    ...rest,
    created_at: createdAt,
    updated_at: updatedAt,
  };
}

function toApiMessage(message: (typeof messages)[number]) {
  const { createdAt, ...rest } = message;

  return {
    ...rest,
    created_at: createdAt,
  };
}

export const db = {
  requests: allRequests.map(toApiRequest),
  users: [...users],
  messages: messages.map(toApiMessage),
};
