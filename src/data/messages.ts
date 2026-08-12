import type { Message } from "../shared/types";

export const messages: Message[] = [
  {
    id: "m1",
    requestId: "r1",
    authorId: "u1",
    body: "My laptop won't boot after installing the latest Windows update.",
    createdAt: "2026-07-27T08:00:00Z",
  },
  {
    id: "m2",
    requestId: "r2",
    authorId: "u1",
    body: "The VPN disconnects every 15 minutes while I'm working remotely.",
    createdAt: "2026-07-26T09:30:00Z",
  },
  {
    id: "m3",
    requestId: "r2",
    authorId: "u2",
    body: "We're currently investigating the VPN gateway. We'll update you shortly.",
    createdAt: "2026-07-26T10:00:00Z",
  },
];

export interface CreateMessageInput {
  requestId: string;
  authorId: string;
  body: string;
}

export function createMessage(input: CreateMessageInput): Message {
  const message: Message = {
    id: crypto.randomUUID(),
    requestId: input.requestId,
    authorId: input.authorId,
    body: input.body,
    createdAt: new Date().toISOString(),
  };

  messages.push(message);

  return message;
}
