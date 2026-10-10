import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DashboardAlert } from "@/types/dashboard";

const styles: Record<DashboardAlert["type"], string> = {
  "low-stock": "border-amber-400 bg-amber-50 text-amber-700",
  expiring: "border-red-300 bg-red-50 text-red-600",
  "out-of-stock": "border-red-400 bg-red-50 text-red-700",
};

export function RecentAlerts({ alerts }: { alerts: DashboardAlert[] }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base font-semibold">Recent Alerts</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 && <p className="text-sm text-muted-foreground">No alerts — everything looks healthy.</p>}
        {alerts.map((alert, i) => (
          <div key={i} className={cn("rounded-md border-l-4 px-4 py-2", styles[alert.type])}>
            <p className="text-xs font-semibold">{alert.title}</p>
            <p className="text-sm">{alert.detail}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
