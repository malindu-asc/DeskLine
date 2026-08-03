import type { Request } from "../shared/types";
import { api } from "./api";

export const requestService = {
  async getAll() {
    return api<Request[]>("/requests");
  },

  async getById(id: string) {
    return api<Request>(`/requests/${id}`);
  },
};