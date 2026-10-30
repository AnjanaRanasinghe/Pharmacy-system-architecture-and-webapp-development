import { api } from "./client";
import { AppNotification, NotificationsResponse } from "@/types/notification";

export const notificationsApi = {
  list: () => api.get<NotificationsResponse>("/notifications"),
  markRead: (id: string) => api.patch<AppNotification>(`/notifications/${id}/read`),
  markAllRead: () => api.post<void>("/notifications/read-all", {}),
  dismiss: (id: string) => api.delete<void>(`/notifications/${id}`),
};
