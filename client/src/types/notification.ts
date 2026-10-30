export type NotificationType = "IN_STOCK" | "LOW_STOCK" | "EXPIRING_SOON" | "OUT_OF_STOCK";

export interface AppNotification {
  id: string;
  productId: string | null;
  batchId: string | null;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  items: AppNotification[];
  unreadCount: number;
}
