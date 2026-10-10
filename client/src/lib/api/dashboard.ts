import { api } from "./client";
import { Dashboard } from "@/types/dashboard";

export const dashboardApi = {
  get: () => api.get<Dashboard>("/dashboard"),
};
