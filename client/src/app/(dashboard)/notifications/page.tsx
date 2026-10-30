"use client";

import { AlertTriangle, Bell, Calendar, CheckCheck, Package, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/contexts/notifications-context";
import { AppNotification } from "@/types/notification";
import { cn } from "@/lib/utils";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function notificationStyle(n: AppNotification) {
  if (n.type === "OUT_OF_STOCK" || n.message.includes("Reorder immediately") || n.message.includes("expired on")) {
    return { icon: AlertTriangle, classes: "border-red-300 bg-red-50", iconColor: "text-red-600" };
  }
  if (n.type === "EXPIRING_SOON") {
    return { icon: Calendar, classes: "border-amber-300 bg-amber-50", iconColor: "text-amber-600" };
  }
  return { icon: Package, classes: "border-amber-300 bg-amber-50", iconColor: "text-amber-600" };
}

function notificationTitle(n: AppNotification) {
  if (n.type === "OUT_OF_STOCK") return "Out of Stock";
  if (n.type === "EXPIRING_SOON") return "Expiring Soon";
  if (n.message.includes("Reorder immediately")) return "Critical Low Stock";
  return "Low Stock Alert";
}

export default function NotificationsPage() {
  const { items, unreadCount, loading, error, markRead, markAllRead, dismiss, refetch } = useNotifications();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">Stay updated with important alerts</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllRead} className="gap-1.5">
            <CheckCheck className="h-4 w-4" /> Mark All as Read
          </Button>
        )}
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading notifications...</p>}

      {!loading && error && (
        <div className="space-y-3">
          <p className="text-sm text-red-500">Couldn&apos;t load notifications: {error}</p>
          <Button variant="outline" onClick={refetch}>Retry</Button>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-white py-16 text-center">
          <Bell className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">You&apos;re all caught up</p>
          <p className="text-sm text-muted-foreground">No low stock, expiry, or other alerts right now.</p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="space-y-3">
          {items.map((n) => {
            const { icon: Icon, classes, iconColor } = notificationStyle(n);
            return (
              <div
                key={n.id}
                className={cn(
                  "relative flex items-start gap-3 rounded-lg border p-4",
                  classes,
                  !n.isRead && "shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                )}
                onClick={() => !n.isRead && markRead(n.id)}
                onKeyDown={(e) => {
                  if (!n.isRead && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    markRead(n.id);
                  }
                }}
                role={!n.isRead ? "button" : undefined}
                tabIndex={!n.isRead ? 0 : undefined}
              >
                <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", iconColor)} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{notificationTitle(n)}</p>
                    {!n.isRead && (
                      <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-medium text-white">New</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-gray-700">{n.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{timeAgo(n.createdAt)}</p>
                </div>
                <button
                  type="button"
                  aria-label="Dismiss notification"
                  onClick={(e) => {
                    e.stopPropagation();
                    dismiss(n.id);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
