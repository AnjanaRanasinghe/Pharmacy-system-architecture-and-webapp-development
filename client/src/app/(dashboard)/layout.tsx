"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useAuth } from "@/hooks/use-auth";
import { NotificationsProvider } from "@/contexts/notifications-context";
import { SettingsProvider } from "@/contexts/settings-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  // Open by default on desktop (where it's a persistent column), closed by default
  // on mobile (where it's an overlay drawer you pull out on demand).
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches
  );

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading...</div>;
  }

  return (
    <SettingsProvider>
      <NotificationsProvider>
        <div className="flex h-screen overflow-hidden bg-gray-50 print:h-auto print:overflow-visible">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex flex-1 flex-col overflow-y-auto print:overflow-visible">
            <Topbar sidebarOpen={sidebarOpen} onMenuClick={() => setSidebarOpen((v) => !v)} />
            <main className="flex-1 p-8 print:p-0">{children}</main>
          </div>
        </div>
      </NotificationsProvider>
    </SettingsProvider>
  );
}