import type { Request } from "../shared/types";
import { api } from "./api";

export const requestService = {
  async getAll() {
    return api<Request[]>("/requests");
  },

  async getById(id: string) {
    return api<Request>(`/requests/${id}`);
  },
  
  async create(request: Request) {
    return api<Request>("/requests", {
      method: "POST",
      headers:{
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
  }

};