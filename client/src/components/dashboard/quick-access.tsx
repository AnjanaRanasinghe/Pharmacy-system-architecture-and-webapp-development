import Link from "next/link";
import { ShoppingCart, Truck, FileBarChart, Pill, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  {
    href: "/sales/new",
    label: "New Sale Invoice",
    subtitle: "Start a checkout",
    icon: ShoppingCart,
    className: "bg-blue-600 hover:bg-blue-700",
  },
  {
    href: "/purchases/new",
    label: "New Purchase Order",
    subtitle: "Order stock from a supplier",
    icon: Truck,
    className: "bg-purple-600 hover:bg-purple-700",
  },
  {
    href: "/reports",
    label: "Reports",
    subtitle: "Sales & inventory reports",
    icon: FileBarChart,
    className: "bg-emerald-600 hover:bg-emerald-700",
  },
  {
    href: "/medicines",
    label: "Medicines",
    subtitle: "Manage your inventory",
    icon: Pill,
    className: "bg-orange-500 hover:bg-orange-600",
  },
];

export function QuickAccess() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "group flex flex-col justify-between rounded-xl p-5 text-white shadow-sm transition-colors",
            link.className
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <link.icon className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <div className="mt-4">
            <p className="text-lg font-semibold leading-tight">{link.label}</p>
            <p className="text-sm text-white/80">{link.subtitle}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
