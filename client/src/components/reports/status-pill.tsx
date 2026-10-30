import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  LOW_STOCK: "bg-amber-50 text-amber-700",
  CRITICAL: "bg-red-50 text-red-700",
  OUT_OF_STOCK: "bg-red-100 text-red-800",
  EXPIRING_SOON: "bg-amber-50 text-amber-700",
  EXPIRED: "bg-red-100 text-red-800",
};

export const STATUS_LABELS: Record<string, string> = {
  LOW_STOCK: "Low Stock",
  CRITICAL: "Critical",
  OUT_OF_STOCK: "Out of Stock",
  EXPIRING_SOON: "Expiring Soon",
  EXPIRED: "Expired",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_STYLES[status] ?? "bg-gray-100 text-gray-700")}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
