"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMedicines } from "@/hooks/use-medicines";
import { useSales } from "@/hooks/use-sales";
import { MedicineSearchBar } from "@/components/sales/medicine-search-bar";
import { formatCurrency } from "@/lib/utils/currency";
import { ProductInventoryRow } from "@/types/product";

interface SaleRow {
  productId: string;
  name: string;
  brand: string;
  unitPrice: number;
  quantity: number;
  maxQuantity: number;
}

export default function NewSaleInvoicePage() {
  const router = useRouter();
  const { medicines, loading } = useMedicines();
  const { createSale } = useSales();

  const [rows, setRows] = useState<SaleRow[]>([]);
  const [discountPercent, setDiscountPercent] = useState("");
  const [cashTendered, setCashTendered] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function addItem(row: ProductInventoryRow) {
    setError(null);
    setRows((prev) => {
      const existing = prev.find((r) => r.productId === row.id);
      if (existing) {
        if (existing.quantity >= row.totalQuantity) return prev;
        return prev.map((r) => (r.productId === row.id ? { ...r, quantity: r.quantity + 1 } : r));
      }
      return [
        ...prev,
        { productId: row.id, name: row.name, brand: row.brand, unitPrice: row.sellingPrice, quantity: 1, maxQuantity: row.totalQuantity },
      ];
    });
  }

  function updateQty(productId: string, value: string) {
    const num = Number(value);
    setRows((prev) =>
      prev.map((r) => (r.productId === productId ? { ...r, quantity: Math.min(Math.max(num || 0, 0), r.maxQuantity) } : r))
    );
  }

  function removeRow(productId: string) {
    setRows((prev) => prev.filter((r) => r.productId !== productId));
  }

  const subtotal = rows.reduce((sum, r) => sum + r.unitPrice * r.quantity, 0);
  const discount = Number(discountPercent) || 0;
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal - discountAmount;
  const cashTendNum = Number(cashTendered) || 0;
  const cashBalance = cashTendNum - total;

  async function handleCompleteSale() {
    if (rows.length === 0) return setError("Add at least one item.");
    if (rows.some((r) => r.quantity <= 0)) return setError("Every item needs a quantity greater than 0.");
    if (cashTendNum < total) return setError("Cash tendered is less than the total.");

    setSubmitting(true);
    setError(null);
    try {
      const sale = await createSale({
        paymentMethod: "CASH",
        discountPercent: discount || undefined,
        cashTendered: cashTendNum,
        items: rows.map((r) => ({ productId: r.productId, quantity: r.quantity })),
      });
      setRows([]);
      setDiscountPercent("");
      setCashTendered("");
      router.push(`/sales/${sale.id}?print=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not complete sale.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sales / Point of Sale</h1>
        <p className="text-sm text-muted-foreground">Process customer sales and generate invoices</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-lg border bg-white p-6 lg:col-span-2">
          {loading && <p className="text-sm text-muted-foreground">Loading medicines...</p>}
          <MedicineSearchBar medicines={medicines} onAdd={addItem} />

          {rows.length === 0 && (
            <p className="text-sm text-muted-foreground">Scan a barcode or search above to add items.</p>
          )}

          {rows.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-2">Medicine</th>
                    <th className="py-2 pr-2">Qty</th>
                    <th className="py-2 pr-2">Unit price</th>
                    <th className="py-2 pr-2">Line total</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.productId} className="border-b last:border-0">
                      <td className="py-2 pr-2">
                        <div className="font-medium">{row.name}</div>
                        <div className="text-xs text-muted-foreground">{row.brand}</div>
                      </td>
                      <td className="py-2 pr-2">
                        <Input
                          className="h-8 w-20"
                          type="number"
                          min={1}
                          max={row.maxQuantity}
                          value={row.quantity || ""}
                          onChange={(e) => updateQty(row.productId, e.target.value)}
                        />
                        <p className="mt-0.5 text-[11px] text-muted-foreground">of {row.maxQuantity} in stock</p>
                      </td>
                      <td className="py-2 pr-2 whitespace-nowrap">{formatCurrency(row.unitPrice)}</td>
                      <td className="py-2 pr-2 whitespace-nowrap font-medium">{formatCurrency(row.unitPrice * row.quantity)}</td>
                      <td className="py-2">
                        <Button variant="ghost" size="icon" onClick={() => removeRow(row.productId)} aria-label="Remove item">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="h-fit space-y-4 rounded-lg border bg-white p-4">
          <h2 className="font-semibold">Bill Summary</h2>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Discount (%)</Label>
            <Input type="number" min={0} max={100} step="0.01" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} placeholder="0" />
          </div>

          <div className="space-y-1 border-t pt-3 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Items</span><span>{rows.length}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            {discount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Discount ({discount}%)</span><span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span><span className="text-blue-600">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="space-y-1.5 border-t pt-3">
            <Label className="text-xs text-muted-foreground">Payment Method</Label>
            <div className="space-y-2">
              <button type="button" className="flex w-full items-center gap-2 rounded-md bg-black px-3 py-2 text-sm font-medium text-white">
                Cash
              </button>
              <button type="button" disabled className="flex w-full cursor-not-allowed items-center gap-2 rounded-md border px-3 py-2 text-sm text-muted-foreground">
                Card (coming soon)
              </button>
            </div>
          </div>

          <div className="space-y-1.5 border-t pt-3">
            <Label className="text-xs text-muted-foreground">Cash tendered (Rs.)</Label>
            <Input type="number" min={0} step="0.01" value={cashTendered} onChange={(e) => setCashTendered(e.target.value)} placeholder="0.00" />
          </div>

          <div className="flex justify-between border-t pt-3 text-sm font-semibold">
            <span>Cash balance</span>
            <span className={cashBalance < 0 ? "text-red-500" : "text-green-600"}>{formatCurrency(cashBalance)}</span>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            className="w-full bg-green-600 text-white hover:bg-green-700"
            disabled={submitting || rows.length === 0}
            onClick={handleCompleteSale}
          >
            {submitting ? "Completing..." : "Complete Sale"}
          </Button>
        </div>
      </div>
    </div>
  );
}
