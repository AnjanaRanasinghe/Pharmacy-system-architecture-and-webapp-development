import { Boxes, DollarSign, Package } from "lucide-react";
import { ReportStatTile } from "./report-stat-tile";
import { PurchaseReport } from "@/types/report";
import { formatCurrency } from "@/lib/utils/currency";

export function PurchaseReportView({ report }: { report: PurchaseReport }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-muted-foreground">Purchase Report Summary</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ReportStatTile
            label="Total Amount"
            value={formatCurrency(report.summary.totalAmount)}
            icon={DollarSign}
            iconBg="bg-blue-100 text-blue-600"
            valueColor="text-blue-600"
          />
          <ReportStatTile
            label="Orders Placed"
            value={String(report.summary.totalOrders)}
            icon={Package}
            iconBg="bg-purple-100 text-purple-600"
            valueColor="text-purple-600"
          />
          <ReportStatTile
            label="Items Received"
            value={String(report.summary.totalItemsReceived)}
            icon={Boxes}
            iconBg="bg-green-100 text-green-600"
            valueColor="text-green-600"
          />
        </div>
      </div>

      <div className="rounded-xl border bg-white">
        <div className="border-b p-4">
          <h3 className="text-sm font-semibold">Daily Breakdown</h3>
        </div>
        {report.daily.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No purchase orders in this date range.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="p-3">Date</th>
                <th className="p-3">Orders</th>
                <th className="p-3">Items</th>
                <th className="p-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {report.daily.map((d) => (
                <tr key={d.date} className="border-b last:border-0">
                  <td className="p-3">{d.date}</td>
                  <td className="p-3">{d.orders}</td>
                  <td className="p-3">{d.items}</td>
                  <td className="p-3 text-blue-600">{formatCurrency(d.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 font-semibold">
                <td className="p-3">Total</td>
                <td className="p-3">{report.summary.totalOrders}</td>
                <td className="p-3">{report.summary.totalItemsReceived}</td>
                <td className="p-3 text-blue-600">{formatCurrency(report.summary.totalAmount)}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {report.bySupplier.length > 0 && (
        <div className="rounded-xl border bg-white">
          <div className="border-b p-4">
            <h3 className="text-sm font-semibold">By Supplier</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="p-3">Supplier</th>
                <th className="p-3">Orders</th>
                <th className="p-3">Items</th>
                <th className="p-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {report.bySupplier.map((s) => (
                <tr key={s.supplier} className="border-b last:border-0">
                  <td className="p-3">{s.supplier}</td>
                  <td className="p-3">{s.orders}</td>
                  <td className="p-3">{s.items}</td>
                  <td className="p-3">{formatCurrency(s.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 font-semibold">
                <td className="p-3">Total</td>
                <td className="p-3">{report.bySupplier.reduce((sum, s) => sum + s.orders, 0)}</td>
                <td className="p-3">{report.bySupplier.reduce((sum, s) => sum + s.items, 0)}</td>
                <td className="p-3">{formatCurrency(report.bySupplier.reduce((sum, s) => sum + s.amount, 0))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
