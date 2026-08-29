"use client";

import { Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Topbar() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <header className="flex items-center justify-between border-b bg-white px-8 py-4">
      <div>
        <p className="text-sm font-medium">Welcome back, Admin User</p>
        <p className="text-xs text-muted-foreground">{today}</p>
      </div>

      <div className="flex items-center gap-5">
        <button className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5 text-gray-500" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] text-white">
            3
          </span>
        </button>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <p className="font-medium leading-none">Admin User</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}