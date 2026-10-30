"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Plus, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSales } from "@/hooks/use-sales";
import { formatCurrency } from "@/lib/utils/currency";
import { groupSaleItemsForDisplay, lineDiscountAmount, lineNetAmount } from "@/lib/utils/sale-items";
import { cn } from "@/lib/utils";
import { toDateInputValue } from "@/lib/utils/date";

const PAYMENT_METHODS = ["CASH", "CARD", "OTHER"] as const;

export default function SalesInvoicesPage() {
  const { sales, loading, error, refetch } = useSales();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [invoiceQuery, setInvoiceQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [cashierFilter, setCashierFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");

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

      <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="relative w-44 space-y-1.5">
          <Label htmlFor="filterInvoice">Invoice #</Label>
          <Input
            id="filterInvoice"
            value={invoiceQuery}
            onChange={(e) => setInvoiceQuery(e.target.value)}
            placeholder="e.g. INV-2026-0012"
            className="pr-7"
          />
          {invoiceQuery && (
            <button
              type="button"
              onClick={() => setInvoiceQuery("")}
              aria-label="Clear invoice filter"
              className="absolute right-1.5 top-[34px] text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="w-40 space-y-1.5">
          <Label htmlFor="filterDate">Date</Label>
          <Input id="filterDate" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        </div>

        <div className="w-44 space-y-1.5">
          <Label>Cashier</Label>
          <Select value={cashierFilter} onValueChange={(v) => setCashierFilter(v ?? "ALL")}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All cashiers</SelectItem>
              {cashierOptions.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="w-36 space-y-1.5">
          <Label>Payment</Label>
          <Select value={paymentFilter} onValueChange={(v) => setPaymentFilter(v ?? "ALL")}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All methods</SelectItem>
              {PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters}>Clear filters</Button>
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
                <th className="p-3">Subtotal</th>
                <th className="p-3">Discount</th>
                <th className="p-3">Total</th>
                <th className="p-3">Cash tend</th>
                <th className="p-3">Cash balance</th>
                <th className="p-3">Payment</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((s) => {
                const isOpen = expandedId === s.id;
                const cashBalance = s.cashTendered != null ? s.cashTendered - s.totalAmount : null;
                const totalDiscount = s.subtotalAmount - s.totalAmount;
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
                      <td className="p-3">{formatCurrency(s.subtotalAmount)}</td>
                      <td className="p-3">{totalDiscount > 0 ? formatCurrency(totalDiscount) : "—"}</td>
                      <td className="p-3 font-medium">{formatCurrency(s.totalAmount)}</td>
                      <td className="p-3">{s.cashTendered != null ? formatCurrency(s.cashTendered) : "—"}</td>
                      <td className="p-3">{cashBalance != null ? formatCurrency(cashBalance) : "—"}</td>
                      <td className="p-3">{s.paymentMethod}</td>
                      <td className="p-3 text-right">
                        <Link href={`/sales/${s.id}?print=1`} onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" aria-label="Print invoice">
                            <Printer className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="border-b bg-gray-50 last:border-0">
                        <td colSpan={12} className="p-4">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-left text-muted-foreground">
                                <th className="pb-2">Product</th>
                                <th className="pb-2">Qty</th>
                                <th className="pb-2">Unit price</th>
                                <th className="pb-2">Discount</th>
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
    </div>
  );
}
