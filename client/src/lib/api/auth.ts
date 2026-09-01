import { api } from "./client";
import { AuthUser } from "@/types/user";

export const authApi = {
  login: (email: string, password: string) => api.post<AuthUser>("/auth/login", { email, password }),
  register: (email: string, password: string) => api.post<AuthUser>("/auth/register", { email, password }),
  me: () => api.get<AuthUser>("/auth/me"),
  logout: () => api.post<void>("/auth/logout", {}),
};