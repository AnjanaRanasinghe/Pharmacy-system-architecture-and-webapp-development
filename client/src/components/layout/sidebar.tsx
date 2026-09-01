"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Pill, Tags, Truck, ShoppingCart,
  DollarSign, Users, FileText, Bell, Settings,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Medicines", href: "/medicines", icon: Pill },
  { label: "Categories", href: "/categories", icon: Tags },
  { label: "Suppliers", href: "/suppliers", icon: Truck },
  { label: "Purchases", href: "/purchases", icon: ShoppingCart },
  { label: "Sales / POS", href: "/sales", icon: DollarSign },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r bg-white">
      <div className="flex items-center gap-2 border-b px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
          <Pill className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold leading-none">HPK Pharmacy & Laboratory</p>
          <p className="text-xs text-muted-foreground">Inventory system</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg border-l-4 px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-blue-600 bg-blue-50 font-semibold text-blue-600"
                  : "border-transparent text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}