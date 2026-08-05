import type { User } from "../shared/types";
import { api } from "./api";
import { setSession, clearSession } from "./session";

interface LoginResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(email: string, password: string) {
    const data = await api<LoginResponse>("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    setSession(data);

    return data;
  },

  logout() {
    clearSession();
  },
};
