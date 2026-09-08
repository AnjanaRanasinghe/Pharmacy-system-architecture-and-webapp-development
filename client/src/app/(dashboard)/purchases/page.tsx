"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePurchases } from "@/hooks/use-purchases";

export default function PurchaseOrdersPage() {
  const { purchases, loading, error, refetch } = usePurchases();

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
                <th className="p-3">PO number</th>
                <th className="p-3">Supplier</th>
                <th className="p-3">Order date</th>
                <th className="p-3">Items</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="p-3 font-medium">{p.poNumber}</td>
                  <td className="p-3">{p.supplier?.name}</td>
                  <td className="p-3 text-muted-foreground">{new Date(p.orderDate).toLocaleDateString()}</td>
                  <td className="p-3">{p.items.length}</td>
                  <td className="p-3">${Number(p.totalAmount).toFixed(2)}</td>
                  <td className="p-3"><Badge className="bg-green-500 text-white hover:bg-inherit">{p.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}