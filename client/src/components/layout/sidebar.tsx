"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSettings } from "@/contexts/settings-context";
import {
  LayoutDashboard, Pill, Tags, Truck, ShoppingCart,
  DollarSign, FileText, Bell, Settings, ChevronDown, X,
} from "lucide-react";

type NavLeaf = { label: string; href: string };
type NavItem =
  | { label: string; href: string; icon: React.ElementType; children?: undefined }
  | { label: string; icon: React.ElementType; href?: undefined; children: NavLeaf[] };

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Medicines", href: "/medicines", icon: Pill },
  {
    label: "Sales / POS",
    icon: DollarSign,
    children: [
      { label: "New Sale Invoice", href: "/sales/new" },
      { label: "Sales Invoices", href: "/sales" },
    ],
  },
  {
    label: "Purchases",
    icon: ShoppingCart,
    children: [
      { label: "New Purchase Order", href: "/purchases/new" },
      { label: "Purchase Orders", href: "/purchases" },
    ],
  },
  { label: "Categories", href: "/categories", icon: Tags },
  { label: "Suppliers", href: "/suppliers", icon: Truck },
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

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { settings } = useSettings();
  const navRef = useRef<HTMLElement>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navItems.forEach((item) => {
      if (item.children) {
        initial[item.label] = item.children.some((c) => pathname.startsWith(c.href));
      }
    });
    return initial;
  });

  // Navigating to a page closes the drawer, but only below `lg` — there, the sidebar
  // is a full-screen overlay that should get out of the way once you've picked a
  // page. At `lg` and up it's a collapsible column the user toggles on purpose, so
  // following a link shouldn't fight that choice by collapsing it back.
  useEffect(() => {
    if (typeof window !== "undefined" && !window.matchMedia("(min-width: 1024px)").matches) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Esc closes the mobile drawer, same as any other overlay in the app.
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Arrow keys move focus through whichever links/buttons are currently visible
  // (collapsed groups' children are unmounted, so they're naturally skipped).
  // Enter already activates a focused link/button natively — nothing extra needed.
  function handleNavKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const container = navRef.current;
    if (!container) return;
    const focusables = Array.from(container.querySelectorAll<HTMLElement>("a[href], button"));
    if (focusables.length === 0) return;
    e.preventDefault();
    const currentIndex = focusables.indexOf(document.activeElement as HTMLElement);
    const nextIndex = e.key === "ArrowDown"
      ? Math.min(currentIndex + 1, focusables.length - 1)
      : Math.max(currentIndex - 1, 0);
    focusables[nextIndex]?.focus();
  }

  return (
    <>
      {/* Dims the page and closes the drawer on click — only below `lg`, where the
          sidebar overlays content instead of sitting in the page's own flex row. */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex shrink-0 flex-col overflow-hidden border-r bg-white transition-all duration-300 ease-in-out print:hidden",
          "lg:static lg:z-auto",
          open ? "w-64 translate-x-0" : "w-64 -translate-x-full lg:w-0 lg:translate-x-0 lg:border-r-0"
        )}
      >
        <div className="flex w-64 items-center gap-2 border-b px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Pill className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold leading-none">{settings?.name || "Pharmacy"}</p>
            <p className="text-xs text-muted-foreground">Inventory system</p>
          </div>
          <button
            aria-label="Close menu"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

      <nav ref={navRef} onKeyDown={handleNavKeyDown} className="w-64 flex-1 space-y-1 overflow-y-auto px-3 py-4">
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
    </>
  );
}