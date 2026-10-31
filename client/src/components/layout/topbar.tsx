"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/contexts/notifications-context";
import { displayNameFromEmail } from "@/lib/utils/user";

interface TopbarProps {
  sidebarOpen: boolean;
  onMenuClick: () => void;
}

export function Topbar({ sidebarOpen, onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const displayName = user?.name || (user?.email ? displayNameFromEmail(user.email) : "");

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <header className="flex items-center justify-between border-b bg-white px-4 py-4 sm:px-8 print:hidden">
      <div className="flex items-center gap-3">
        <button
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          onClick={onMenuClick}
          className="-ml-1 rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        >
          {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
        </button>
        <div>
          <p className="text-sm font-medium">Welcome back, {displayName}</p>
          <p className="text-xs text-muted-foreground">{today}</p>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button
          className="relative"
          aria-label="Notifications"
          onClick={() => router.push("/notifications")}
        >
          <Bell className="h-5 w-5 text-gray-500" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <div className="relative">
          <button onClick={() => setMenuOpen((v) => !v)} className="flex items-center gap-2">
            <Avatar className="h-8 w-8"><AvatarFallback>{displayName.charAt(0)}</AvatarFallback></Avatar>
            <div className="text-left text-sm">
              <p className="font-medium leading-none">{user?.email}</p>
              <p className="text-xs text-muted-foreground">{displayName}</p>
            </div>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-40 rounded-lg border bg-white py-1 shadow-lg">
              <button onClick={handleLogout} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-500 hover:bg-gray-50">
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}