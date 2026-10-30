"use client";

import { useCallback, useEffect, useState } from "react";
import { Boxes, CalendarClock, DollarSign, Download, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReportTypeCard } from "@/components/reports/report-type-card";
import { SalesReportView } from "@/components/reports/sales-report-view";
import { PurchaseReportView } from "@/components/reports/purchase-report-view";
import { StockReportView } from "@/components/reports/stock-report-view";
import { ExpiryReportView } from "@/components/reports/expiry-report-view";
import { STATUS_LABELS } from "@/components/reports/status-pill";
import { reportsApi } from "@/lib/api/reports";
import { ExpiryReport, PurchaseReport, SalesReport, StockReport } from "@/types/report";
import { formatCurrency } from "@/lib/utils/currency";
import { toDateInputValue } from "@/lib/utils/date";
import { exportReportExcel, exportReportPdf, ReportColumn } from "@/lib/utils/report-export";
import { useSettings } from "@/contexts/settings-context";

type ReportType = "SALES" | "PURCHASE" | "STOCK" | "EXPIRY";
type DateRange = { from: string; to: string };

const REPORT_LABELS: Record<ReportType, string> = {
  SALES: "Sales Report",
  PURCHASE: "Purchase Report",
  STOCK: "Stock Report",
  EXPIRY: "Expiry Report",
};

export default function ReportsPage() {
  const { settings } = useSettings();
  const [reportType, setReportType] = useState<ReportType>("SALES");
  const [ranges, setRanges] = useState<Partial<Record<ReportType, DateRange>>>({});
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [purchaseReport, setPurchaseReport] = useState<PurchaseReport | null>(null);
  const [stockReport, setStockReport] = useState<StockReport | null>(null);
  const [expiryReport, setExpiryReport] = useState<ExpiryReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async (type: ReportType, range?: DateRange) => {
    setLoading(true);
    setError(null);
    try {
      if (type === "SALES") {
        const data = await reportsApi.getSales(range?.from, range?.to);
        setSalesReport(data);
        setRanges((prev) => ({ ...prev, SALES: { from: data.from, to: data.to } }));
      } else if (type === "PURCHASE") {
        const data = await reportsApi.getPurchases(range?.from, range?.to);
        setPurchaseReport(data);
        setRanges((prev) => ({ ...prev, PURCHASE: { from: data.from, to: data.to } }));
      } else if (type === "STOCK") {
        setStockReport(await reportsApi.getStock());
      } else {
        const data = await reportsApi.getExpiry(range?.from, range?.to);
        setExpiryReport(data);
        setRanges((prev) => ({ ...prev, EXPIRY: { from: data.from, to: data.to } }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load report");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport("SALES");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSelectType(type: ReportType) {
    setReportType(type);
    const hasData =
      (type === "SALES" && salesReport) ||
      (type === "PURCHASE" && purchaseReport) ||
      (type === "STOCK" && stockReport) ||
      (type === "EXPIRY" && expiryReport);
    if (!hasData) fetchReport(type, ranges[type]);
  }

  function handleFromChange(value: string) {
    const current = ranges[reportType] ?? { from: "", to: "" };
    const next = { ...current, from: value };
    setRanges((prev) => ({ ...prev, [reportType]: next }));
    if (next.from && next.to) fetchReport(reportType, next);
  }

  function handleToChange(value: string) {
    const current = ranges[reportType] ?? { from: "", to: "" };
    const next = { ...current, to: value };
    setRanges((prev) => ({ ...prev, [reportType]: next }));
    if (next.from && next.to) fetchReport(reportType, next);
  }

  function buildExportPayload(): { title: string; subtitle: string; columns: ReportColumn[]; rows: Record<string, unknown>[]; summaryLines: string[] } | null {
    if (reportType === "SALES" && salesReport) {
      return {
        title: "Sales Report",
        subtitle: `${salesReport.from} to ${salesReport.to}`,
        columns: [
          { header: "Date", key: "date" },
          { header: "Transactions", key: "transactions" },
          { header: "Revenue (Rs.)", key: "revenue" },
          { header: "Profit (Rs.)", key: "profit" },
        ],
        rows: [
          ...(salesReport.daily as unknown as Record<string, unknown>[]),
          {
            date: "Total",
            transactions: salesReport.summary.totalTransactions,
            revenue: salesReport.summary.totalRevenue,
            profit: salesReport.summary.totalProfit,
          },
        ],
        summaryLines: [
          `Total Revenue: ${formatCurrency(salesReport.summary.totalRevenue)}`,
          `Total Profit: ${formatCurrency(salesReport.summary.totalProfit)} (${salesReport.summary.marginPercent}% margin)`,
          `Transactions: ${salesReport.summary.totalTransactions}`,
        ],
      };
    }
    if (reportType === "PURCHASE" && purchaseReport) {
      return {
        title: "Purchase Report",
        subtitle: `${purchaseReport.from} to ${purchaseReport.to}`,
        columns: [
          { header: "Date", key: "date" },
          { header: "Orders", key: "orders" },
          { header: "Items", key: "items" },
          { header: "Amount (Rs.)", key: "amount" },
        ],
        rows: [
          ...(purchaseReport.daily as unknown as Record<string, unknown>[]),
          {
            date: "Total",
            orders: purchaseReport.summary.totalOrders,
            items: purchaseReport.summary.totalItemsReceived,
            amount: purchaseReport.summary.totalAmount,
          },
        ],
        summaryLines: [
          `Total Amount: ${formatCurrency(purchaseReport.summary.totalAmount)}`,
          `Orders: ${purchaseReport.summary.totalOrders}`,
          `Items Received: ${purchaseReport.summary.totalItemsReceived}`,
        ],
      };
    }
    if (reportType === "STOCK" && stockReport) {
      return {
        title: "Stock Report",
        subtitle: `As of ${toDateInputValue(new Date())}`,
        columns: [
          { header: "Medicine", key: "name" },
          { header: "Brand", key: "brand" },
          { header: "Category", key: "category" },
          { header: "Current Stock", key: "currentStock" },
          { header: "Reorder Level", key: "reorderLevel" },
          { header: "Status", key: "statusLabel" },
        ],
        rows: [
          ...stockReport.items.map((i) => ({ ...i, statusLabel: STATUS_LABELS[i.status] ?? i.status })),
          {
            name: `Total (${stockReport.items.length} items)`,
            brand: "",
            category: "",
            currentStock: stockReport.items.reduce((sum, i) => sum + i.currentStock, 0),
            reorderLevel: stockReport.items.reduce((sum, i) => sum + i.reorderLevel, 0),
            statusLabel: "",
          },
        ],
        summaryLines: [
          `Flagged items: ${stockReport.summary.totalFlagged}`,
          `Out of stock: ${stockReport.summary.outOfStock}, Critical: ${stockReport.summary.critical}, Low stock: ${stockReport.summary.lowStock}`,
        ],
      };
    }
    if (reportType === "EXPIRY" && expiryReport) {
      return {
        title: "Expiry Report",
        subtitle: `${expiryReport.from} to ${expiryReport.to}`,
        columns: [
          { header: "Medicine", key: "name" },
          { header: "Brand", key: "brand" },
          { header: "Batch", key: "batchNumber" },
          { header: "Quantity", key: "quantity" },
          { header: "Expiry Date", key: "expiryDate" },
          { header: "Status", key: "statusLabel" },
        ],
        rows: [
          ...expiryReport.items.map((i) => ({ ...i, statusLabel: STATUS_LABELS[i.status] ?? i.status })),
          {
            name: `Total (${expiryReport.items.length} batches)`,
            brand: "",
            batchNumber: "",
            quantity: expiryReport.items.reduce((sum, i) => sum + i.quantity, 0),
            expiryDate: "",
            statusLabel: "",
          },
        ],
        summaryLines: [
          `Total flagged: ${expiryReport.summary.total}`,
          `Expired: ${expiryReport.summary.expired}, Critical: ${expiryReport.summary.critical}, Expiring soon: ${expiryReport.summary.expiringSoon}`,
        ],
      };
    }
    return null;
  }

  const exportPayload = buildExportPayload();

  function handleExportPdf() {
    if (!exportPayload) return;
    exportReportPdf({
      filename: `${reportType.toLowerCase()}-report-${toDateInputValue(new Date())}.pdf`,
      pharmacyName: settings?.name,
      title: exportPayload.title,
      subtitle: exportPayload.subtitle,
      columns: exportPayload.columns,
      rows: exportPayload.rows,
      summaryLines: exportPayload.summaryLines,
    });
  }

  function handleExportExcel() {
    if (!exportPayload) return;
    exportReportExcel({
      filename: `${reportType.toLowerCase()}-report-${toDateInputValue(new Date())}.xlsx`,
      sheetName: exportPayload.title,
      columns: exportPayload.columns,
      rows: exportPayload.rows,
    });
  }

  const currentRange = ranges[reportType];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports &amp; Analytics</h1>
        <p className="text-sm text-muted-foreground">Generate and export detailed reports</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <ReportTypeCard
          label="Sales Report"
          icon={DollarSign}
          iconBg="bg-green-100 text-green-600"
          active={reportType === "SALES"}
          onClick={() => handleSelectType("SALES")}
        />
        <ReportTypeCard
          label="Purchase Report"
          icon={Boxes}
          iconBg="bg-blue-100 text-blue-600"
          active={reportType === "PURCHASE"}
          onClick={() => handleSelectType("PURCHASE")}
        />
        <ReportTypeCard
          label="Stock Report"
          icon={Boxes}
          iconBg="bg-purple-100 text-purple-600"
          active={reportType === "STOCK"}
          onClick={() => handleSelectType("STOCK")}
        />
        <ReportTypeCard
          label="Expiry Report"
          icon={CalendarClock}
          iconBg="bg-red-100 text-red-600"
          active={reportType === "EXPIRY"}
          onClick={() => handleSelectType("EXPIRY")}
        />
      </div>

      <div className="rounded-xl border bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-muted-foreground">Generate Report</h2>
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-56 space-y-1.5">
            <Label>Report Type</Label>
            <Select
              value={reportType}
              onValueChange={(v) => v && handleSelectType(v as ReportType)}
              items={(Object.keys(REPORT_LABELS) as ReportType[]).map((key) => ({ value: key, label: REPORT_LABELS[key] }))}
            >
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(REPORT_LABELS) as ReportType[]).map((key) => (
                  <SelectItem key={key} value={key}>{REPORT_LABELS[key]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-44 space-y-1.5">
            <Label>From Date</Label>
            <Input
              type="date"
              disabled={reportType === "STOCK"}
              value={reportType === "STOCK" ? "" : currentRange?.from ?? ""}
              onChange={(e) => handleFromChange(e.target.value)}
            />
          </div>
          <div className="w-44 space-y-1.5">
            <Label>To Date</Label>
            <Input
              type="date"
              disabled={reportType === "STOCK"}
              value={reportType === "STOCK" ? "" : currentRange?.to ?? ""}
              onChange={(e) => handleToChange(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleExportPdf} disabled={!exportPayload} className="gap-1.5">
              <Download className="h-4 w-4" /> Export as PDF
            </Button>
            <Button variant="outline" onClick={handleExportExcel} disabled={!exportPayload} className="gap-1.5">
              <FileSpreadsheet className="h-4 w-4" /> Export as Excel
            </Button>
          </div>
        </div>

        {reportType === "STOCK" && (
          <p className="mt-3 text-xs text-muted-foreground">
            Stock levels reflect current inventory right now and aren&apos;t limited by a date range.
          </p>
        )}
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading report...</p>}

      {!loading && error && (
        <div className="space-y-3">
          <p className="text-sm text-red-500">Couldn&apos;t load report: {error}</p>
          <Button variant="outline" onClick={() => fetchReport(reportType, ranges[reportType])}>Retry</Button>
        </div>
      )}

      {!loading && !error && reportType === "SALES" && salesReport && <SalesReportView report={salesReport} />}
      {!loading && !error && reportType === "PURCHASE" && purchaseReport && <PurchaseReportView report={purchaseReport} />}
      {!loading && !error && reportType === "STOCK" && stockReport && <StockReportView report={stockReport} />}
      {!loading && !error && reportType === "EXPIRY" && expiryReport && <ExpiryReportView report={expiryReport} />}
    </div>
  );
}
