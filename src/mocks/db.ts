import { requests, users, messages } from "../data";
import { generateRequests, generateMessagesForRequests } from "./generateRequests";

// The 3 hand-written fixtures stay small and readable for demo purposes;
// bulk synthetic data is generated separately so the Queue has a
// realistic (500+) volume without the fixture file being unreadable.
const generatedRequests = generateRequests(500, "u1");
const allRequests = [...requests, ...generatedRequests];

// Only for the generated requests - the 3 fixtures already have their own
// hand-written messages in data/messages.ts; running this over them too
// would create a duplicate first message on top of the real one.
const allMessages = [...messages, ...generateMessagesForRequests(generatedRequests)];

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
  messages: allMessages.map(toApiMessage),
};
