import type { User } from "../shared/types";
import { api } from "./api";

export const userService = {
  async getAll() {
    return api<User[]>("/users");
  },

  async getById(id: string) {
    return api<User>(`/users/${id}`);
  },
};