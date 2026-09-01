"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

function displayNameFromEmail(email: string) {
  const local = email.split("@")[0];
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export function Topbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const displayName = user?.name || (user?.email ? displayNameFromEmail(user.email) : "");

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <header className="flex items-center justify-between border-b bg-white px-8 py-4">
      <div>
        <p className="text-sm font-medium">Welcome back, {user?.email}</p>
        <p className="text-xs text-muted-foreground">{today}</p>
      </div>

      <div className="flex items-center gap-5">
        <button className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5 text-gray-500" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] text-white">3</span>
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