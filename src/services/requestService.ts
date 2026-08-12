import type {
  Request,
  RequestCategory,
  RequestPriority,
  RequestStatus,
} from "../shared/types";
import { api } from "./api";

// The shape the mock/real API actually returns over the wire — distinct
// from the UI-facing `Request` type. Only the timestamp field names
// diverge here (a common real-world API/UI mismatch), but keeping this
// as its own type means the divergence is enforced by the compiler,
// not just a convention nobody checks.
interface ApiRequest {
  id: string;
  title: string;
  status: RequestStatus;
  priority: RequestPriority;
  category: RequestCategory;
  requesterId: string;
  assigneeId: string | null;
  created_at: string;
  updated_at: string;
}

function toRequest(apiRequest: ApiRequest): Request {
  const { created_at, updated_at, ...rest } = apiRequest;

  return {
    ...rest,
    createdAt: created_at,
    updatedAt: updated_at,
  };
}

function toApiRequest(request: Request): ApiRequest {
  const { createdAt, updatedAt, ...rest } = request;

  return {
    ...rest,
    created_at: createdAt,
    updated_at: updatedAt,
  };
}

export const requestService = {
  async getAll() {
    const data = await api<ApiRequest[]>("/requests");
    return data.map(toRequest);
  },

  async getById(id: string) {
    const data = await api<ApiRequest>(`/requests/${id}`);
    return toRequest(data);
  },

  async create(request: Request) {
    const data = await api<ApiRequest>("/requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(toApiRequest(request)),
    });
    return toRequest(data);
  },

  async update(id: string, updates: Omit<Partial<Request>, "createdAt" | "updatedAt">) {
    const data = await api<ApiRequest>(`/requests/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });
    return toRequest(data);
  },

  async delete(id: string) {
    return api<void>(`/requests/${id}`, {
      method: "DELETE",
    });
  },
};
