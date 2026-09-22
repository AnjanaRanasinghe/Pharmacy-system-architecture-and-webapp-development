"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { ChevronDown, Plus, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSales } from "@/hooks/use-sales";
import { formatCurrency } from "@/lib/utils/currency";
import { groupSaleItemsForDisplay } from "@/lib/utils/sale-items";
import { cn } from "@/lib/utils";

export default function SalesInvoicesPage() {
  const { sales, loading, error, refetch } = useSales();
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

      {!loading && !error && sales.length > 0 && (
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
                <th className="p-3">Payment</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => {
                const isOpen = expandedId === s.id;
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
                      <td className="p-3">{s.discountPercent > 0 ? `${s.discountPercent}%` : "—"}</td>
                      <td className="p-3 font-medium">{formatCurrency(s.totalAmount)}</td>
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
                        <td colSpan={10} className="p-4">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-left text-muted-foreground">
                                <th className="pb-2">Product</th>
                                <th className="pb-2">Qty</th>
                                <th className="pb-2">Unit price</th>
                                <th className="pb-2">Line total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {groupSaleItemsForDisplay(s.items).map((line) => (
                                <tr key={line.key}>
                                  <td className="py-1.5">{line.name} ({line.brand})</td>
                                  <td className="py-1.5">{line.quantity}</td>
                                  <td className="py-1.5">{formatCurrency(line.price)}</td>
                                  <td className="py-1.5">{formatCurrency(line.price * line.quantity)}</td>
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
