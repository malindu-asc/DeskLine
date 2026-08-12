import type { Request, RequestCategory, RequestPriority } from "../shared/types";

export const requests: Request[] = [
  {
    id: "r1",
    title: "Laptop won't boot",
    status: "open",
    priority: "high",
    category: "hardware",
    requesterId: "u1",
    assigneeId: null,
    createdAt: "2026-07-27T08:00:00Z",
    updatedAt: "2026-07-27T08:00:00Z",
  },
  {
    id: "r2",
    title: "VPN disconnects frequently",
    status: "pending",
    priority: "medium",
    category: "software",
    requesterId: "u1",
    assigneeId: "u2",
    createdAt: "2026-07-26T09:30:00Z",
    updatedAt: "2026-07-26T10:00:00Z",
  },
  {
    id: "r3",
    title: "Office air conditioner not working",
    status: "closed",
    priority: "high",
    category: "facilities",
    requesterId: "u1",
    assigneeId: "u3",
    createdAt: "2026-07-25T10:15:00Z",
    updatedAt: "2026-07-25T15:30:00Z",
  },
];

export interface CreateRequestInput {
  title: string;
  category: RequestCategory;
  priority: RequestPriority;
  requesterId: string;
}

export function createRequest(input: CreateRequestInput): Request {
  const now = new Date().toISOString();

  const request: Request = {
    id: crypto.randomUUID(),
    title: input.title,
    status: "open",
    priority: input.priority,
    category: input.category,
    requesterId: input.requesterId,
    assigneeId: null,
    createdAt: now,
    updatedAt: now,
  };

  requests.push(request);

  return request;
}

export function cancelRequest(id: string): Request | undefined {
  const request = requests.find((existing) => existing.id === id);

  if (!request || request.status !== "open") {
    return request;
  }

  request.status = "cancelled";
  request.updatedAt = new Date().toISOString();

  return request;
}
