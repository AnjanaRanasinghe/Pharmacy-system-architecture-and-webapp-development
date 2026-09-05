"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Pill, Tags, Truck, ShoppingCart,
  DollarSign, Users, FileText, Bell, Settings, ChevronDown,
} from "lucide-react";

type NavLeaf = { label: string; href: string };
type NavItem =
  | { label: string; href: string; icon: React.ElementType; children?: undefined }
  | { label: string; icon: React.ElementType; href?: undefined; children: NavLeaf[] };

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Medicines", href: "/medicines", icon: Pill },
  { label: "Categories", href: "/categories", icon: Tags },
  { label: "Suppliers", href: "/suppliers", icon: Truck },
  {
    label: "Purchases",
    icon: ShoppingCart,
    children: [
      { label: "New purchase order", href: "/purchases/new" },
      { label: "Purchase orders", href: "/purchases" },
    ],
  },
  {
    label: "Sales / POS",
    icon: DollarSign,
    children: [
      { label: "New sale invoice", href: "/sales/new" },
      { label: "Sales invoices", href: "/sales" },
    ],
  },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
];

const linkClasses = (active: boolean) =>
  cn(
    "flex items-center gap-3 rounded-lg border-l-4 px-3 py-2 text-sm font-medium transition-colors",
    active
      ? "border-blue-600 bg-blue-50 font-semibold text-blue-600"
      : "border-transparent text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
  );

export function Sidebar() {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navItems.forEach((item) => {
      if (item.children) {
        initial[item.label] = item.children.some((c) => pathname.startsWith(c.href));
      }
    });
    return initial;
  });

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

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          if (!item.children) {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={linkClasses(active)}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          }

          const isOpen = openGroups[item.label];
          const groupActive = item.children.some((c) => pathname === c.href);

          return (
            <div key={item.label}>
              <button
                onClick={() => setOpenGroups((prev) => ({ ...prev, [item.label]: !prev[item.label] }))}
                className={cn(linkClasses(groupActive), "w-full justify-between")}
              >
                <span className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </span>
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")} />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-4 mt-1 space-y-1 border-l pl-3">
                      {item.children.map((child) => {
                        const active = pathname === child.href;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "block rounded-md px-3 py-1.5 text-sm transition-colors",
                              active
                                ? "bg-blue-50 font-semibold text-blue-600"
                                : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                            )}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}