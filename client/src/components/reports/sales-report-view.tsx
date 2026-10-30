import { DollarSign, Percent, Receipt, TrendingUp } from "lucide-react";
import { ReportStatTile } from "./report-stat-tile";
import { SalesReport } from "@/types/report";
import { formatCurrency } from "@/lib/utils/currency";

export function SalesReportView({ report }: { report: SalesReport }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-muted-foreground">Sales Report Summary</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <ReportStatTile
            label="Total Revenue"
            value={formatCurrency(report.summary.totalRevenue)}
            icon={TrendingUp}
            iconBg="bg-green-100 text-green-600"
            valueColor="text-green-600"
          />
          <ReportStatTile
            label="Total Profit"
            value={formatCurrency(report.summary.totalProfit)}
            icon={DollarSign}
            iconBg="bg-blue-100 text-blue-600"
            valueColor="text-blue-600"
          />
          <ReportStatTile
            label="Margin"
            value={`${report.summary.marginPercent}%`}
            icon={Percent}
            iconBg="bg-purple-100 text-purple-600"
            valueColor="text-purple-600"
          />
          <ReportStatTile
            label="Transactions"
            value={String(report.summary.totalTransactions)}
            icon={Receipt}
            iconBg="bg-amber-100 text-amber-600"
            valueColor="text-amber-600"
          />
        </div>

        {(report.byPayment.length > 0 || report.summary.refundCount > 0) && (
          <div className="mt-4 flex flex-wrap gap-3 border-t pt-4">
            {report.byPayment.map((p) => (
              <div key={p.method} className="rounded-lg bg-blue-50/60 px-3 py-2 text-xs text-gray-700">
                <span className="font-medium">{p.method}</span> — {p.count} sale{p.count === 1 ? "" : "s"} · {formatCurrency(p.amount)}
              </div>
            ))}
            {report.summary.refundCount > 0 && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                <span className="font-medium">Refunds</span> — {report.summary.refundCount} return{report.summary.refundCount === 1 ? "" : "s"} ·{" "}
                -{formatCurrency(report.summary.totalRefunds)}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-white">
        <div className="border-b p-4">
          <h3 className="text-sm font-semibold">Daily Breakdown</h3>
        </div>
        {report.daily.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No sales in this date range.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="p-3">Date</th>
                <th className="p-3">Transactions</th>
                <th className="p-3">Revenue</th>
                <th className="p-3">Profit</th>
              </tr>
            </thead>
            <tbody>
              {report.daily.map((d) => (
                <tr key={d.date} className="border-b last:border-0">
                  <td className="p-3">{d.date}</td>
                  <td className="p-3">{d.transactions}</td>
                  <td className="p-3 text-green-600">{formatCurrency(d.revenue)}</td>
                  <td className="p-3 text-blue-600">{formatCurrency(d.profit)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 font-semibold">
                <td className="p-3">Total</td>
                <td className="p-3">{report.summary.totalTransactions}</td>
                <td className="p-3 text-green-600">{formatCurrency(report.summary.totalRevenue)}</td>
                <td className="p-3 text-blue-600">{formatCurrency(report.summary.totalProfit)}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {report.topProducts.length > 0 && (
        <div className="rounded-xl border bg-white">
          <div className="border-b p-4">
            <h3 className="text-sm font-semibold">Top Selling Medicines</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="p-3">Medicine</th>
                <th className="p-3">Quantity sold</th>
                <th className="p-3">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {report.topProducts.map((p) => (
                <tr key={`${p.name}-${p.brand}`} className="border-b last:border-0">
                  <td className="p-3">
                    {p.name} <span className="text-muted-foreground">({p.brand})</span>
                  </td>
                  <td className="p-3">{p.quantity}</td>
                  <td className="p-3">{formatCurrency(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 font-semibold">
                <td className="p-3">Total (top {report.topProducts.length})</td>
                <td className="p-3">{report.topProducts.reduce((sum, p) => sum + p.quantity, 0)}</td>
                <td className="p-3">{formatCurrency(report.topProducts.reduce((sum, p) => sum + p.revenue, 0))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
