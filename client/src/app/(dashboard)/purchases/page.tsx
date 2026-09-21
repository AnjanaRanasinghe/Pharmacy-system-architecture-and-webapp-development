"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePurchases } from "@/hooks/use-purchases";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";

export default function PurchaseOrdersPage() {
  const { purchases, loading, error, refetch } = usePurchases();
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

      {!loading && !error && purchases.length > 0 && (
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
              {purchases.map((p) => {
                const isOpen = expandedId === p.id;
                return (
                  <>
                    <tr
                      key={p.id}
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
                      <tr key={`${p.id}-detail`} className="border-b bg-gray-50 last:border-0">
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
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}