import type { Message } from "../shared/types";
import { api } from "./api";

export const messageService = {
  async getByRequestId(requestId: string) {
    return api<Message[]>(`/requests/${requestId}/messages`);
  },

  async create(message: Message) {
    return api<Message>(`/requests/${message.requestId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
  },
};