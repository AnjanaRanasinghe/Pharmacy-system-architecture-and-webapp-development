"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, ChevronDown, Hash, Plus, Printer, RotateCcw, SlidersHorizontal, User, Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSales } from "@/hooks/use-sales";
import { formatCurrency, formatNumber } from "@/lib/utils/currency";
import { groupSaleItemsForDisplay, lineDiscountAmount, lineNetAmount } from "@/lib/utils/sale-items";
import { cn } from "@/lib/utils";
import { toDateInputValue } from "@/lib/utils/date";
import { ReturnDialog, ReturnSubmitPayload } from "@/components/sales/return-dialog";

const PAYMENT_METHODS = ["CASH", "CARD", "OTHER"] as const;

export default function SalesInvoicesPage() {
  const { sales, loading, error, refetch, createReturn } = useSales();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [invoiceQuery, setInvoiceQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [cashierFilter, setCashierFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [returnSaleId, setReturnSaleId] = useState<string | null>(null);

  const returnSale = sales.find((s) => s.id === returnSaleId) ?? null;

  async function handleReturnSubmit(payload: ReturnSubmitPayload) {
    if (!returnSaleId) return;
    await createReturn(returnSaleId, payload);
  }

  function cashierLabel(s: { user?: { name: string | null; email: string } }) {
    return s.user?.name || s.user?.email || "Unknown";
  }

  const cashierOptions = useMemo(() => {
    const names = new Set(sales.map(cashierLabel));
    return Array.from(names).sort();
  }, [sales]);

  const filteredSales = useMemo(() => {
    const invoiceQueryLower = invoiceQuery.trim().toLowerCase();
    return sales.filter((s) => {
      if (invoiceQueryLower && !s.invoiceNumber.toLowerCase().includes(invoiceQueryLower)) return false;
      if (dateFilter && toDateInputValue(new Date(s.soldAt)) !== dateFilter) return false;
      if (cashierFilter !== "ALL" && cashierLabel(s) !== cashierFilter) return false;
      if (paymentFilter !== "ALL" && s.paymentMethod !== paymentFilter) return false;
      return true;
    });
  }, [sales, invoiceQuery, dateFilter, cashierFilter, paymentFilter]);

  const hasActiveFilters = Boolean(invoiceQuery || dateFilter || cashierFilter !== "ALL" || paymentFilter !== "ALL");

  function clearFilters() {
    setInvoiceQuery("");
    setDateFilter("");
    setCashierFilter("ALL");
    setPaymentFilter("ALL");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sales invoices</h1>
          <p className="text-sm text-muted-foreground">A history of every sale made at checkout</p>
        </div>
        <Link href="/sales/new">
          <Button><Plus className="mr-1.5 h-4 w-4" /> New sale invoice</Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/60 p-2.5">
        <span className="flex items-center gap-1.5 pl-1 text-sm font-medium text-blue-700">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </span>

        <div className="relative">
          <Hash className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-blue-400" />
          <Input
            value={invoiceQuery}
            onChange={(e) => setInvoiceQuery(e.target.value)}
            placeholder="Invoice #"
            className="h-9 w-36 rounded-lg border-blue-100 bg-white pl-8 pr-7 shadow-sm focus-visible:border-blue-400 focus-visible:ring-blue-200"
          />
          {invoiceQuery && (
            <button
              type="button"
              onClick={() => setInvoiceQuery("")}
              aria-label="Clear invoice filter"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="relative">
          <Calendar className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-blue-400" />
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-9 w-[9.5rem] rounded-lg border-blue-100 bg-white pl-8 shadow-sm focus-visible:border-blue-400 focus-visible:ring-blue-200"
          />
        </div>

        <Select value={cashierFilter} onValueChange={(v) => setCashierFilter(v ?? "ALL")}>
          <SelectTrigger className="h-9 gap-1.5 rounded-lg border-blue-100 bg-white px-2.5 shadow-sm">
            <User className="h-3.5 w-3.5 shrink-0 text-blue-400" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All cashiers</SelectItem>
            {cashierOptions.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={paymentFilter} onValueChange={(v) => setPaymentFilter(v ?? "ALL")}>
          <SelectTrigger className="h-9 gap-1.5 rounded-lg border-blue-100 bg-white px-2.5 shadow-sm">
            <Wallet className="h-3.5 w-3.5 shrink-0 text-blue-400" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All methods</SelectItem>
            {PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex h-9 items-center gap-1 rounded-lg px-2.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading sales invoices...</p>}

      {!loading && error && (
        <div className="space-y-3">
          <p className="text-sm text-red-500">Couldn't load sales invoices: {error}</p>
          <Button variant="outline" onClick={refetch}>Retry</Button>
        </div>
      )}

      {!loading && !error && sales.length === 0 && (
        <p className="text-sm text-muted-foreground">No sales yet — completed sales will appear here.</p>
      )}

      {!loading && !error && sales.length > 0 && filteredSales.length === 0 && (
        <p className="text-sm text-muted-foreground">No invoices match the selected filters.</p>
      )}

      {!loading && !error && filteredSales.length > 0 && (
        <div className="rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="p-3"></th>
                <th className="p-3">Invoice #</th>
                <th className="p-3">Date</th>
                <th className="p-3">Cashier</th>
                <th className="p-3">Items</th>
                <th className="p-3 text-right">Subtotal (Rs)</th>
                <th className="p-3 text-right">Discount (Rs)</th>
                <th className="p-3 text-right">Total (Rs)</th>
                <th className="p-3 text-right">Cash tend (Rs)</th>
                <th className="p-3 text-right">Cash balance (Rs)</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((s) => {
                const isOpen = expandedId === s.id;
                const cashBalance = s.cashTendered != null ? s.cashTendered - s.totalAmount : null;
                const totalDiscount = s.subtotalAmount - s.totalAmount;
                const totalRefunded = s.returns.reduce((sum, r) => sum + r.refundAmount, 0);
                const isFullyReturned = totalRefunded > 0 && s.totalAmount - totalRefunded <= 0.01;
                return (
                  <Fragment key={s.id}>
                    <tr
                      className="cursor-pointer border-b last:border-0 hover:bg-gray-50"
                      onClick={() => setExpandedId(isOpen ? null : s.id)}
                    >
                      <td className="p-3">
                        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                      </td>
                      <td className="p-3 font-medium">{s.invoiceNumber}</td>
                      <td className="p-3 text-muted-foreground">{new Date(s.soldAt).toLocaleString()}</td>
                      <td className="p-3">{s.user?.name || s.user?.email}</td>
                      <td className="p-3">{s.items.length}</td>
                      <td className="p-3 text-right tabular-nums">{formatNumber(s.subtotalAmount)}</td>
                      <td className="p-3 text-right tabular-nums">{totalDiscount > 0 ? formatNumber(totalDiscount) : "—"}</td>
                      <td className="p-3 text-right font-medium tabular-nums">{formatNumber(s.totalAmount)}</td>
                      <td className="p-3 text-right tabular-nums">{s.cashTendered != null ? formatNumber(s.cashTendered) : "—"}</td>
                      <td className="p-3 text-right tabular-nums">{cashBalance != null ? formatNumber(cashBalance) : "—"}</td>
                      <td className="p-3">{s.paymentMethod}</td>
                      <td className="p-3">
                        {totalRefunded > 0 ? (
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-xs font-medium",
                              isFullyReturned ? "bg-red-100 text-red-800" : "bg-amber-50 text-amber-700"
                            )}
                          >
                            {isFullyReturned ? "Fully returned" : "Partially returned"}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Return items"
                            onClick={(e) => {
                              e.stopPropagation();
                              setReturnSaleId(s.id);
                            }}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Link href={`/sales/${s.id}?print=1`} onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" aria-label="Print invoice">
                              <Printer className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="border-b bg-gray-50 last:border-0">
                        <td colSpan={13} className="p-4">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-left text-muted-foreground">
                                <th className="pb-2">Product</th>
                                <th className="pb-2">Qty</th>
                                <th className="pb-2">Unit price</th>
                                <th className="pb-2">Discount (%)</th>
                                <th className="pb-2">Line total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {groupSaleItemsForDisplay(s.items).map((line) => (
                                <tr key={line.key}>
                                  <td className="py-1.5">{line.name} ({line.brand})</td>
                                  <td className="py-1.5">{line.quantity}</td>
                                  <td className="py-1.5">{formatCurrency(line.price)}</td>
                                  <td className="py-1.5">
                                    {line.discountPercent > 0
                                      ? `${line.discountPercent}% (-${formatCurrency(lineDiscountAmount(line))})`
                                      : "—"}
                                  </td>
                                  <td className="py-1.5">{formatCurrency(lineNetAmount(line))}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {s.returns.length > 0 && (
                            <div className="mt-3 border-t pt-3">
                              <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Returns</p>
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="text-left text-muted-foreground">
                                    <th className="pb-2">Return #</th>
                                    <th className="pb-2">Date</th>
                                    <th className="pb-2">Items</th>
                                    <th className="pb-2">Refund</th>
                                    <th className="pb-2">Reason</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {s.returns.map((r) => (
                                    <tr key={r.id}>
                                      <td className="py-1.5">{r.returnNumber}</td>
                                      <td className="py-1.5">{new Date(r.createdAt).toLocaleString()}</td>
                                      <td className="py-1.5">{r.items.reduce((sum, i) => sum + i.quantity, 0)}</td>
                                      <td className="py-1.5 text-red-600">-{formatCurrency(r.refundAmount)}</td>
                                      <td className="py-1.5 text-muted-foreground">{r.reason || "—"}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ReturnDialog
        open={returnSaleId !== null}
        onOpenChange={(open) => !open && setReturnSaleId(null)}
        sale={returnSale}
        onSubmit={handleReturnSubmit}
      />
    </div>
  );
}
