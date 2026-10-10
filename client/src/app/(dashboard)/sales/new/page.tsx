"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMedicines } from "@/hooks/use-medicines";
import { useSales } from "@/hooks/use-sales";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
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
  discountPercent: number;
}

type CellColumn = "qty" | "discount";

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function rowGross(row: SaleRow) {
  return row.unitPrice * row.quantity;
}

function rowDiscountAmount(row: SaleRow) {
  return round2(rowGross(row) * (row.discountPercent / 100));
}

function rowNet(row: SaleRow) {
  return round2(rowGross(row) - rowDiscountAmount(row));
}

export default function NewSaleInvoicePage() {
  const router = useRouter();
  const { medicines, loading } = useMedicines();
  const { createSale } = useSales();
  const searchRef = useRef<HTMLInputElement>(null);
  const cellRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const billDiscountRef = useRef<HTMLInputElement>(null);
  const cashTenderedRef = useRef<HTMLInputElement>(null);
  const completeSaleRef = useRef<HTMLButtonElement>(null);

  const [rows, setRows] = useState<SaleRow[]>([]);
  const [billDiscountPercent, setBillDiscountPercent] = useState("");
  const [cashTendered, setCashTendered] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Set right after a scan/search add, so a (post-render) effect can jump
  // keyboard focus straight to that row's Qty field.
  const [pendingFocusId, setPendingFocusId] = useState<string | null>(null);

  useEffect(() => {
    if (!pendingFocusId) return;
    cellRefs.current[`${pendingFocusId}-qty`]?.focus();
    setPendingFocusId(null);
  }, [rows, pendingFocusId]);

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
        {
          productId: row.id, name: row.name, brand: row.brand, unitPrice: row.sellingPrice,
          quantity: 1, maxQuantity: row.totalQuantity, discountPercent: 0,
        },
      ];
    });
    setPendingFocusId(row.id);
  }

  function updateQty(productId: string, value: string) {
    const num = Number(value);
    setRows((prev) =>
      prev.map((r) => (r.productId === productId ? { ...r, quantity: Math.min(Math.max(num || 0, 0), r.maxQuantity) } : r))
    );
  }

  function bumpQty(productId: string, delta: number) {
    setRows((prev) =>
      prev.map((r) => (r.productId === productId ? { ...r, quantity: Math.min(Math.max(r.quantity + delta, 1), r.maxQuantity) } : r))
    );
  }

  function updateDiscount(productId: string, value: string) {
    const num = Math.min(Math.max(Number(value) || 0, 0), 100);
    setRows((prev) => prev.map((r) => (r.productId === productId ? { ...r, discountPercent: num } : r)));
  }

  function removeRow(productId: string) {
    setRows((prev) => prev.filter((r) => r.productId !== productId));
  }

  // Grid boundaries flow into the rest of the page: above the first row goes
  // back to the search box, below the last row goes into the Bill Summary.
  function focusCell(rowIndex: number, col: CellColumn) {
    if (rowIndex < 0) { searchRef.current?.focus(); return; }
    if (rowIndex >= rows.length) { billDiscountRef.current?.focus(); return; }
    cellRefs.current[`${rows[rowIndex].productId}-${col}`]?.focus();
  }

  function focusLastRow(col: CellColumn) {
    if (rows.length === 0) { searchRef.current?.focus(); return; }
    focusCell(rows.length - 1, col);
  }

  // Bill Summary chain: Enter or ↓ moves to the next field, ↑ moves back.
  function handleBillDiscountKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === "ArrowDown") { e.preventDefault(); cashTenderedRef.current?.focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); focusLastRow("discount"); }
  }

  function handleCashTenderedKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === "ArrowDown") { e.preventDefault(); completeSaleRef.current?.focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); billDiscountRef.current?.focus(); }
  }

  function handleCompleteButtonKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    // Enter/Space already activate a focused button natively.
    if (e.key === "ArrowUp") { e.preventDefault(); cashTenderedRef.current?.focus(); }
  }

  // Keyboard-driven grid: arrows move between rows/columns, +/- bump quantity,
  // Delete removes the row — all without leaving the keyboard.
  function handleCellKeyDown(e: React.KeyboardEvent<HTMLInputElement>, rowIndex: number, col: CellColumn, productId: string) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        focusCell(rowIndex + 1, col);
        break;
      case "ArrowUp":
        e.preventDefault();
        focusCell(rowIndex - 1, col);
        break;
      case "ArrowRight":
        if (col === "qty") { e.preventDefault(); focusCell(rowIndex, "discount"); }
        break;
      case "ArrowLeft":
        if (col === "discount") { e.preventDefault(); focusCell(rowIndex, "qty"); }
        break;
      case "+":
      case "=":
        if (col === "qty") { e.preventDefault(); bumpQty(productId, 1); }
        break;
      case "-":
        if (col === "qty") { e.preventDefault(); bumpQty(productId, -1); }
        break;
      case "Delete":
        e.preventDefault();
        removeRow(productId);
        break;
    }
  }

  // Gross total, before any discount.
  const subtotal = rows.reduce((sum, r) => sum + rowGross(r), 0);
  // Each item's own discount applies first...
  const itemDiscountTotal = rows.reduce((sum, r) => sum + rowDiscountAmount(r), 0);
  const afterItemDiscount = subtotal - itemDiscountTotal;
  // ...then the overall bill discount applies on what's left.
  const billDiscount = Number(billDiscountPercent) || 0;
  const billDiscountAmount = round2(afterItemDiscount * (billDiscount / 100));
  const total = round2(afterItemDiscount - billDiscountAmount);
  const totalDiscount = round2(itemDiscountTotal + billDiscountAmount);

  const cashTendNum = Number(cashTendered) || 0;
  const cashBalance = cashTendNum - total;

  async function handleCompleteSale() {
    if (submitting) return;
    if (rows.length === 0) return setError("Add at least one item.");
    if (rows.some((r) => r.quantity <= 0)) return setError("Every item needs a quantity greater than 0.");
    if (cashTendNum < total) return setError("Cash tendered is less than the total.");

    setSubmitting(true);
    setError(null);
    try {
      const sale = await createSale({
        paymentMethod: "CASH",
        discountPercent: billDiscount || undefined,
        cashTendered: cashTendNum,
        items: rows.map((r) => ({ productId: r.productId, quantity: r.quantity, discountPercent: r.discountPercent || undefined })),
      });
      setRows([]);
      setBillDiscountPercent("");
      setCashTendered("");
      router.push(`/sales/${sale.id}?print=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not complete sale.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleNewSale() {
    if (submitting) return;
    setRows([]);
    setBillDiscountPercent("");
    setCashTendered("");
    setError(null);
    searchRef.current?.focus();
  }

  // Global, page-scoped shortcuts — F-keys fire even while typing since they
  // never collide with normal text entry.
  useKeyboardShortcut("F2", handleNewSale, { allowInInputs: true });
  useKeyboardShortcut("F4", () => searchRef.current?.focus(), { allowInInputs: true });
  useKeyboardShortcut("F9", () => { handleCompleteSale(); }, { allowInInputs: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sales / Point of Sale</h1>
        <p className="text-sm text-muted-foreground">
          Process customer sales and generate invoices — <kbd className="rounded border px-1">F2</kbd> new sale ·{" "}
          <kbd className="rounded border px-1">F4</kbd> focus search · <kbd className="rounded border px-1">F9</kbd> complete sale
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-lg border bg-white p-6 lg:col-span-2">
          {loading && <p className="text-sm text-muted-foreground">Loading medicines...</p>}
          <MedicineSearchBar ref={searchRef} medicines={medicines} onAdd={addItem} />

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
                    <th className="py-2 pr-2">Discount (%)</th>
                    <th className="py-2 pr-2">Line total</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr key={row.productId} className="border-b last:border-0">
                      <td className="py-2 pr-2">
                        <div className="font-medium">{row.name}</div>
                        <div className="text-xs text-muted-foreground">{row.brand}</div>
                      </td>
                      <td className="py-2 pr-2">
                        <Input
                          ref={(el) => { cellRefs.current[`${row.productId}-qty`] = el; }}
                          className="h-8 w-20"
                          type="number"
                          min={1}
                          max={row.maxQuantity}
                          value={row.quantity || ""}
                          onChange={(e) => updateQty(row.productId, e.target.value)}
                          onKeyDown={(e) => handleCellKeyDown(e, rowIndex, "qty", row.productId)}
                        />
                        <p className="mt-0.5 text-[11px] text-muted-foreground">of {row.maxQuantity} in stock</p>
                      </td>
                      <td className="py-2 pr-2 whitespace-nowrap">{formatCurrency(row.unitPrice)}</td>
                      <td className="py-2 pr-2">
                        <Input
                          ref={(el) => { cellRefs.current[`${row.productId}-discount`] = el; }}
                          className="h-8 w-20"
                          type="number"
                          min={0}
                          max={100}
                          step="0.01"
                          value={row.discountPercent || ""}
                          onChange={(e) => updateDiscount(row.productId, e.target.value)}
                          onKeyDown={(e) => handleCellKeyDown(e, rowIndex, "discount", row.productId)}
                          placeholder="0"
                        />
                      </td>
                      <td className="py-2 pr-2 whitespace-nowrap font-medium">{formatCurrency(rowNet(row))}</td>
                      <td className="py-2">
                        <Button variant="ghost" size="icon" onClick={() => removeRow(row.productId)} aria-label="Remove item">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Tip: use ↑ ↓ ← → to move between fields, +/- to adjust quantity, Delete to remove a row.
                ↓ from the last row continues into Bill Summary.
              </p>
            </div>
          )}
        </div>

        <div className="h-fit space-y-4 rounded-lg border bg-white p-4">
          <h2 className="font-semibold">Bill Summary</h2>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Discount (%)</Label>
            <Input
              ref={billDiscountRef}
              type="number" min={0} max={100} step="0.01"
              value={billDiscountPercent}
              onChange={(e) => setBillDiscountPercent(e.target.value)}
              onKeyDown={handleBillDiscountKeyDown}
              placeholder="0"
            />
          </div>

          <div className="space-y-1 border-t pt-3 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Items</span><span>{rows.length}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Discount</span><span>-{formatCurrency(totalDiscount)}</span>
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
            <Input
              ref={cashTenderedRef}
              type="number" min={0} step="0.01"
              value={cashTendered}
              onChange={(e) => setCashTendered(e.target.value)}
              onKeyDown={handleCashTenderedKeyDown}
              placeholder="0.00"
            />
          </div>

          <div className="flex justify-between border-t pt-3 text-sm font-semibold">
            <span>Cash balance</span>
            <span className={cashBalance < 0 ? "text-red-500" : "text-green-600"}>{formatCurrency(cashBalance)}</span>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            ref={completeSaleRef}
            className="w-full bg-green-600 text-white hover:bg-green-700"
            disabled={submitting || rows.length === 0}
            onClick={handleCompleteSale}
            onKeyDown={handleCompleteButtonKeyDown}
          >
            {submitting ? "Completing..." : "Complete Sale (F9)"}
          </Button>
        </div>
      </div>
    </div>
  );
}
