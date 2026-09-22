"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, DollarSign, Minus, Plus, Search, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMedicines } from "@/hooks/use-medicines";
import { useSales } from "@/hooks/use-sales";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";
import { ProductInventoryRow } from "@/types/product";

interface CartItem {
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

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return medicines;
    return medicines.filter((m) =>
      [m.name, m.brand, m.barcode].some((field) => field?.toLowerCase().includes(q))
    );
  }, [medicines, search]);

  function addToCart(row: ProductInventoryRow) {
    if (row.totalQuantity <= 0) return;
    setError(null);
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === row.id);
      if (existing) {
        if (existing.quantity >= row.totalQuantity) return prev;
        return prev.map((c) => (c.productId === row.id ? { ...c, quantity: c.quantity + 1 } : c));
      }
      return [
        ...prev,
        {
          productId: row.id, name: row.name, brand: row.brand,
          unitPrice: row.sellingPrice, quantity: 1, maxQuantity: row.totalQuantity,
        },
      ];
    });
  }

  function changeQty(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((c) => (c.productId === productId ? { ...c, quantity: Math.min(c.quantity + delta, c.maxQuantity) } : c))
        .filter((c) => c.quantity > 0)
    );
  }

  function removeItem(productId: string) {
    setCart((prev) => prev.filter((c) => c.productId !== productId));
  }

  const subtotal = cart.reduce((sum, c) => sum + c.unitPrice * c.quantity, 0);
  const discount = Number(discountPercent) || 0;
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal - discountAmount;

  async function handleCompleteSale() {
    if (cart.length === 0) return setError("Cart is empty.");
    setSubmitting(true);
    setError(null);
    try {
      const sale = await createSale({
        paymentMethod: "CASH",
        discountPercent: discount || undefined,
        items: cart.map((c) => ({ productId: c.productId, quantity: c.quantity })),
      });
      setCart([]);
      setDiscountPercent("");
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
        <div className="space-y-4 lg:col-span-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search medicines by name, brand, or barcode..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading && <p className="text-sm text-muted-foreground">Loading medicines...</p>}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {filtered.map((m) => {
              const outOfStock = m.totalQuantity <= 0;
              const inCart = cart.find((c) => c.productId === m.id);
              const atMax = inCart ? inCart.quantity >= m.totalQuantity : false;
              return (
                <div key={m.id} className={cn("rounded-lg border bg-white p-4", outOfStock && "opacity-50")}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.brand}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Stock: {m.totalQuantity}{outOfStock && " (out of stock)"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-600">{formatCurrency(m.sellingPrice)}</p>
                      <Button
                        size="icon"
                        className="mt-2 h-8 w-8 rounded-md bg-black text-white hover:bg-gray-800"
                        disabled={outOfStock || atMax}
                        onClick={() => addToCart(m)}
                        aria-label={`Add ${m.name}`}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            {!loading && filtered.length === 0 && (
              <p className="col-span-full text-sm text-muted-foreground">No medicines match your search.</p>
            )}
          </div>
        </div>

        <div className="h-fit space-y-4 rounded-lg border bg-white p-4">
          <div className="flex items-center gap-2 font-semibold">
            <ShoppingCart className="h-4 w-4" /> Current Sale
          </div>

          {cart.length === 0 && (
            <p className="text-sm text-muted-foreground">Cart is empty — add medicines from the left.</p>
          )}

          <div className="space-y-3">
            {cart.map((c) => (
              <div key={c.productId} className="flex items-center justify-between gap-2 border-b pb-3 last:border-0">
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(c.unitPrice)} each</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => changeQty(c.productId, -1)} aria-label="Decrease quantity">
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="w-6 text-center text-sm">{c.quantity}</span>
                  <Button
                    variant="outline" size="icon" className="h-7 w-7"
                    disabled={c.quantity >= c.maxQuantity}
                    onClick={() => changeQty(c.productId, 1)}
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItem(c.productId)} aria-label="Remove item">
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 border-t pt-3">
            <label className="text-xs font-medium text-muted-foreground">Discount (%)</label>
            <Input
              type="number" min={0} max={100} step="0.01"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="space-y-1 border-t pt-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
            </div>
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
            <label className="text-xs font-medium text-muted-foreground">Payment Method</label>
            <div className="space-y-2">
              <button type="button" className="flex w-full items-center gap-2 rounded-md bg-black px-3 py-2 text-sm font-medium text-white">
                <DollarSign className="h-4 w-4" /> Cash
              </button>
              <button type="button" disabled className="flex w-full cursor-not-allowed items-center gap-2 rounded-md border px-3 py-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4" /> Card (coming soon)
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            className="w-full bg-green-600 text-white hover:bg-green-700"
            disabled={submitting || cart.length === 0}
            onClick={handleCompleteSale}
          >
            {submitting ? "Completing..." : "Complete Sale"}
          </Button>
        </div>
      </div>
    </div>
  );
}
