import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, ArrowUp, ArrowDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  trend: string;
  trendDirection: "up" | "down";
  icon: LucideIcon;
  iconBg: string;
}

export function StatCard({ label, value, trend, trendDirection, icon: Icon, iconBg }: StatCardProps) {
  const isUp = trendDirection === "up";
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg text-white", iconBg)}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-2 text-2xl font-semibold">{value}</p>
        <p className={cn("mt-1 flex items-center gap-1 text-xs", isUp ? "text-green-600" : "text-red-500")}>
          {isUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          {trend}
        </p>
      </CardContent>
    </Card>
  );
}