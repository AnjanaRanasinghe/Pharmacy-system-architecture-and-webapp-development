"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, ChevronDown, Hash, Plus, SlidersHorizontal, Tag, Truck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePurchases } from "@/hooks/use-purchases";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";
import { toDateInputValue } from "@/lib/utils/date";

const PURCHASE_STATUSES = ["PENDING", "RECEIVED", "CANCELLED"] as const;

export default function PurchaseOrdersPage() {
  const { purchases, loading, error, refetch } = usePurchases();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [poQuery, setPoQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const supplierOptions = useMemo(() => {
    const names = new Set(purchases.map((p) => p.supplier?.name).filter(Boolean) as string[]);
    return Array.from(names).sort();
  }, [purchases]);

  const filteredPurchases = useMemo(() => {
    const poQueryLower = poQuery.trim().toLowerCase();
    return purchases.filter((p) => {
      if (poQueryLower && !p.poNumber.toLowerCase().includes(poQueryLower)) return false;
      if (dateFilter && toDateInputValue(new Date(p.orderDate)) !== dateFilter) return false;
      if (supplierFilter !== "ALL" && p.supplier?.name !== supplierFilter) return false;
      if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
      return true;
    });
  }, [purchases, poQuery, dateFilter, supplierFilter, statusFilter]);

  const hasActiveFilters = Boolean(poQuery || dateFilter || supplierFilter !== "ALL" || statusFilter !== "ALL");

  function clearFilters() {
    setPoQuery("");
    setDateFilter("");
    setSupplierFilter("ALL");
    setStatusFilter("ALL");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Purchase orders</h1>
          <p className="text-sm text-muted-foreground">Every order placed with suppliers</p>
        </div>
        <Link href="/purchases/new">
          <Button><Plus className="mr-1.5 h-4 w-4" /> New purchase order</Button>
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
            value={poQuery}
            onChange={(e) => setPoQuery(e.target.value)}
            placeholder="PO number"
            className="h-9 w-36 rounded-lg border-blue-100 bg-white pl-8 pr-7 shadow-sm focus-visible:border-blue-400 focus-visible:ring-blue-200"
          />
          {poQuery && (
            <button
              type="button"
              onClick={() => setPoQuery("")}
              aria-label="Clear PO number filter"
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

        <Select value={supplierFilter} onValueChange={(v) => setSupplierFilter(v ?? "ALL")}>
          <SelectTrigger className="h-9 gap-1.5 rounded-lg border-blue-100 bg-white px-2.5 shadow-sm">
            <Truck className="h-3.5 w-3.5 shrink-0 text-blue-400" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All suppliers</SelectItem>
            {supplierOptions.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "ALL")}>
          <SelectTrigger className="h-9 gap-1.5 rounded-lg border-blue-100 bg-white px-2.5 shadow-sm">
            <Tag className="h-3.5 w-3.5 shrink-0 text-blue-400" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {PURCHASE_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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

      {loading && <p className="text-sm text-muted-foreground">Loading purchase orders...</p>}

      {!loading && error && (
        <div className="space-y-3">
          <p className="text-sm text-red-500">Couldn't load purchase orders: {error}</p>
          <Button variant="outline" onClick={refetch}>Retry</Button>
        </div>
      )}

      {!loading && !error && purchases.length === 0 && (
        <p className="text-sm text-muted-foreground">No purchase orders yet.</p>
      )}

      {!loading && !error && purchases.length > 0 && filteredPurchases.length === 0 && (
        <p className="text-sm text-muted-foreground">No purchase orders match the selected filters.</p>
      )}

      {!loading && !error && filteredPurchases.length > 0 && (
        <div className="rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="p-3"></th>
                <th className="p-3">PO number</th>
                <th className="p-3">Supplier</th>
                <th className="p-3">Order date</th>
                <th className="p-3">Items</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.map((p) => {
                const isOpen = expandedId === p.id;
                return (
                  <Fragment key={p.id}>
                    <tr
                      className="cursor-pointer border-b last:border-0 hover:bg-gray-50"
                      onClick={() => setExpandedId(isOpen ? null : p.id)}
                    >
                      <td className="p-3">
                        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                      </td>
                      <td className="p-3 font-medium">{p.poNumber}</td>
                      <td className="p-3">{p.supplier?.name}</td>
                      <td className="p-3 text-muted-foreground">{new Date(p.orderDate).toLocaleDateString()}</td>
                      <td className="p-3">{p.items.length}</td>
                      <td className="p-3">{formatCurrency(p.totalAmount)}</td>
                      <td className="p-3"><Badge className="bg-green-500 text-white">{p.status}</Badge></td>
                    </tr>
                    {isOpen && (
                      <tr className="border-b bg-gray-50 last:border-0">
                        <td colSpan={7} className="p-4">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-left text-muted-foreground">
                                <th className="pb-2">Product</th>
                                <th className="pb-2">Batch #</th>
                                <th className="pb-2">Expiry</th>
                                <th className="pb-2">Qty</th>
                                <th className="pb-2">Purchased amount</th>
                                <th className="pb-2">Purchase price</th>
                                <th className="pb-2">Selling amount</th>
                                <th className="pb-2">Selling price</th>
                              </tr>
                            </thead>
                            <tbody>
                              {p.items.map((item) => (
                                <tr key={item.id}>
                                  <td className="py-1.5">{item.product?.name} ({item.product?.brand})</td>
                                  <td className="py-1.5">{item.batchNumber}</td>
                                  <td className="py-1.5">{new Date(item.expiryDate).toLocaleDateString()}</td>
                                  <td className="py-1.5">{item.quantity}</td>
                                  <td className="py-1.5">{formatCurrency(item.purchasedAmount)}</td>
                                  <td className="py-1.5">{formatCurrency(item.purchasePrice)}</td>
                                  <td className="py-1.5">{formatCurrency(item.sellingAmount)}</td>
                                  <td className="py-1.5">{formatCurrency(item.sellingPrice)}</td>
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