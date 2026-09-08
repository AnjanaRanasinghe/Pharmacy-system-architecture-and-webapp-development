"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSuppliers } from "@/hooks/use-suppliers";
import { usePurchases } from "@/hooks/use-purchases";
import { ProductPicker } from "@/components/purchases/product-picker";
import { QuickAddProductDialog } from "@/components/purchases/quick-add-product-dialog";
import { Product } from "@/types/product";

interface ItemRow {
  key: string;
  productId: string;
  productName: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  costPrice: number;
}

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const { suppliers } = useSuppliers();
  const { createPurchase } = usePurchases();

  const [supplierId, setSupplierId] = useState("");
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [items, setItems] = useState<ItemRow[]>([]);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddSeed, setQuickAddSeed] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function addProductRow(product: Product) {
    setItems((prev) => [...prev, {
      key: crypto.randomUUID(), productId: product.id,
      productName: `${product.name} (${product.brand})`,
      batchNumber: "", expiryDate: "", quantity: 1, costPrice: 0,
    }]);
  }

  function updateRow(key: string, field: keyof ItemRow, value: string | number) {
    setItems((prev) => prev.map((row) => (row.key === key ? { ...row, [field]: value } : row)));
  }

  function removeRow(key: string) {
    setItems((prev) => prev.filter((row) => row.key !== key));
  }

  const total = items.reduce((sum, row) => sum + row.quantity * row.costPrice, 0);

  async function handleSubmit() {
    if (!supplierId) return setError("Select a supplier.");
    if (items.length === 0) return setError("Add at least one item.");
    if (items.some((r) => !r.batchNumber.trim() || !r.expiryDate || r.quantity <= 0)) {
      return setError("Every item needs a batch number, expiry date, and quantity greater than 0.");
    }

    setSubmitting(true);
    setError(null);
    try {
      await createPurchase({
        supplierId, orderDate, expectedDelivery: expectedDelivery || undefined,
        items: items.map((r) => ({
          productId: r.productId, batchNumber: r.batchNumber,
          expiryDate: r.expiryDate, quantity: r.quantity, costPrice: r.costPrice,
        })),
      });
      router.push("/purchases");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create purchase order.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New purchase order</h1>
        <p className="text-sm text-muted-foreground">Order stock in bulk from a supplier</p>
      </div>

      <div className="space-y-4 rounded-lg border bg-white p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Supplier</Label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
              <SelectContent>
                {suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>PO date</Label>
            <Input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Expected delivery</Label>
            <Input type="date" value={expectedDelivery} onChange={(e) => setExpectedDelivery(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Order items</h2>
          <div className="w-72">
            <ProductPicker onSelect={addProductRow}
              onCreateNew={(seed) => { setQuickAddSeed(seed); setQuickAddOpen(true); }} />
          </div>
        </div>

        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">Scan a barcode or search above to add items.</p>
        )}

        {items.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2">Product</th>
                <th className="py-2">Batch #</th>
                <th className="py-2">Expiry</th>
                <th className="py-2">Qty</th>
                <th className="py-2">Cost price</th>
                <th className="py-2 text-right">Line total</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.key} className="border-b last:border-0">
                  <td className="py-2 pr-2">{row.productName}</td>
                  <td className="py-2 pr-2">
                    <Input className="h-8" value={row.batchNumber}
                      onChange={(e) => updateRow(row.key, "batchNumber", e.target.value)} />
                  </td>
                  <td className="py-2 pr-2">
                    <Input className="h-8" type="date" value={row.expiryDate}
                      onChange={(e) => updateRow(row.key, "expiryDate", e.target.value)} />
                  </td>
                  <td className="py-2 pr-2">
                    <Input className="h-8 w-20" type="number" min={1} value={row.quantity}
                      onChange={(e) => updateRow(row.key, "quantity", Number(e.target.value))} />
                  </td>
                  <td className="py-2 pr-2">
                    <Input className="h-8 w-24" type="number" min={0} step="0.01" value={row.costPrice}
                      onChange={(e) => updateRow(row.key, "costPrice", Number(e.target.value))} />
                  </td>
                  <td className="py-2 text-right font-medium">${(row.quantity * row.costPrice).toFixed(2)}</td>
                  <td className="py-2 text-right">
                    <Button variant="ghost" size="icon" onClick={() => removeRow(row.key)} aria-label="Remove item">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="flex justify-end border-t pt-4">
          <div className="flex w-56 justify-between text-sm font-semibold">
            <span>Total</span><span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push("/purchases")}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Saving..." : "Create purchase order"}
        </Button>
      </div>

      <QuickAddProductDialog open={quickAddOpen} onOpenChange={setQuickAddOpen}
        initialValue={quickAddSeed} onCreated={addProductRow} />
    </div>
  );
}