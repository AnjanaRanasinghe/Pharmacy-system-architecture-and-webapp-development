import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StatusBadge({ lowStock }: { lowStock: boolean }) {
  return (
    <Badge className={cn("rounded-md font-medium text-white", lowStock ? "bg-red-500" : "bg-green-500")}>
      {lowStock ? "Low stock" : "In stock"}
    </Badge>
  );
}