import { api } from "./client";
import { AuthUser } from "@/types/user";

export const authApi = {
  login: (email: string, password: string) => api.post<AuthUser>("/auth/login", { email, password }),
  register: (email: string, password: string) => api.post<AuthUser>("/auth/register", { email, password }),
  resetPassword: (email: string, newPassword: string) => api.post<void>("/auth/reset-password", { email, newPassword }),
  me: () => api.get<AuthUser>("/auth/me"),
  logout: () => api.post<void>("/auth/logout", {}),
};