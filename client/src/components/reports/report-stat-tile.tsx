import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportStatTileProps {
  label: string;
  value: string;
  icon: LucideIcon;
  iconBg: string;
  valueColor?: string;
}

export function ReportStatTile({ label, value, icon: Icon, iconBg, valueColor }: ReportStatTileProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-white p-4">
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", iconBg)}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("text-lg font-semibold", valueColor)}>{value}</p>
      </div>
    </div>
  );
}
