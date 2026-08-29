import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MedicineStatus } from "@/types/medicine";

export function StatusBadge({ status }: { status: MedicineStatus }) {
  return (
    <Badge
      className={cn(
        "rounded-md font-medium text-white hover:bg-inherit",
        status === "in-stock" ? "bg-green-500" : "bg-red-500"
      )}
    >
      {status === "in-stock" ? "In stock" : "Low stock"}
    </Badge>
  );
}