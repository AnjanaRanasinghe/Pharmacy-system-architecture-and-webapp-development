import { CalendarX2, Clock3, PackageX } from "lucide-react";
import { ReportStatTile } from "./report-stat-tile";
import { StatusPill } from "./status-pill";
import { ExpiryReport } from "@/types/report";

export function ExpiryReportView({ report }: { report: ExpiryReport }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-muted-foreground">Expiry Report Summary</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ReportStatTile
            label="Expired"
            value={String(report.summary.expired)}
            icon={PackageX}
            iconBg="bg-red-100 text-red-700"
            valueColor="text-red-700"
          />
          <ReportStatTile
            label="Critical (≤ 30 days)"
            value={String(report.summary.critical)}
            icon={CalendarX2}
            iconBg="bg-red-100 text-red-600"
            valueColor="text-red-600"
          />
          <ReportStatTile
            label="Expiring Soon"
            value={String(report.summary.expiringSoon)}
            icon={Clock3}
            iconBg="bg-amber-100 text-amber-600"
            valueColor="text-amber-600"
          />
        </div>
      </div>

      <div className="rounded-xl border bg-white">
        <div className="border-b p-4">
          <h3 className="text-sm font-semibold">Expiring Medicines Report</h3>
        </div>
        {report.items.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No batches expiring in this date range.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="p-3">Medicine</th>
                <th className="p-3">Batch</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Expiry Date</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {report.items.map((item) => (
                <tr key={`${item.batchNumber}-${item.expiryDate}`} className="border-b last:border-0">
                  <td className="p-3">
                    {item.name} <span className="text-muted-foreground">({item.brand})</span>
                  </td>
                  <td className="p-3 text-muted-foreground">{item.batchNumber}</td>
                  <td className="p-3">{item.quantity}</td>
                  <td className="p-3">{item.expiryDate}</td>
                  <td className="p-3">
                    <StatusPill status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 font-semibold">
                <td className="p-3">Total ({report.items.length} batches)</td>
                <td className="p-3"></td>
                <td className="p-3">{report.items.reduce((sum, i) => sum + i.quantity, 0)}</td>
                <td className="p-3"></td>
                <td className="p-3"></td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}
