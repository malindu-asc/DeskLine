import type { Message } from "../shared/types";
import { api } from "./api";

// See requestService.ts for why this exists separately from `Message`.
interface ApiMessage {
  id: string;
  requestId: string;
  authorId: string;
  body: string;
  created_at: string;
}

function toMessage(apiMessage: ApiMessage): Message {
  const { created_at, ...rest } = apiMessage;

  return {
    ...rest,
    createdAt: created_at,
  };
}

function toApiMessage(message: Message): ApiMessage {
  const { createdAt, ...rest } = message;

  return {
    ...rest,
    created_at: createdAt,
  };
}

export const messageService = {
  async getByRequestId(requestId: string) {
    const data = await api<ApiMessage[]>(`/requests/${requestId}/messages`);
    return data.map(toMessage);
  },

  async create(message: Message) {
    const data = await api<ApiMessage>(`/requests/${message.requestId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(toApiMessage(message)),
    });
    return toMessage(data);
  },
};
