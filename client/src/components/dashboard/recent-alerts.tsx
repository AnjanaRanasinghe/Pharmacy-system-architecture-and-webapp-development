import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AlertType = "low-stock" | "expiring" | "out-of-stock";

const alerts: { type: AlertType; title: string; detail: string }[] = [
  { type: "low-stock", title: "Low Stock", detail: "Paracetamol 500mg" },
  { type: "expiring", title: "Expiring Soon", detail: "Amoxicillin 250mg" },
  { type: "out-of-stock", title: "Out of Stock", detail: "Ibuprofen 400mg" },
  { type: "low-stock", title: "Low Stock", detail: "Aspirin 75mg" },
  { type: "expiring", title: "Expiring Soon", detail: "Cetirizine 10mg" },
];

const styles: Record<AlertType, string> = {
  "low-stock": "border-amber-400 bg-amber-50 text-amber-700",
  expiring: "border-red-300 bg-red-50 text-red-600",
  "out-of-stock": "border-red-400 bg-red-50 text-red-700",
};

export function RecentAlerts() {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base font-semibold">Recent Alerts</CardTitle></CardHeader>
      <CardContent className="space-y-3">
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