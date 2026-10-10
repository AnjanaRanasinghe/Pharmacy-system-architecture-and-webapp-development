"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Pencil, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useSuppliers } from "@/hooks/use-suppliers";
import { usePurchases } from "@/hooks/use-purchases";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { ProductPicker } from "@/components/products/product-picker";
import { NewProductWithBatchDialog, NewProductBatchResult } from "@/components/purchases/new-product-with-batch-dialog";
import { EditPurchaseItemDialog, EditableItemFields } from "@/components/purchases/edit-purchase-item-dialog";
import { SupplierCombobox } from "@/components/suppliers/supplier-combobox";
import { formatCurrency } from "@/lib/utils/currency";
import { Product } from "@/types/product";

interface ItemRow {
  key: string;
  // null while the product hasn't been created yet (added via the "new product"
  // dialog) — it's only created in the database when the purchase order is submitted.
  productId: string | null;
  name: string;
  brand: string;
  barcode?: string;
  categoryId: string;
  reorderLevel: number;
  // Only set for rows that started from an existing product, so we can tell at
  // submit time whether name/brand/reorderLevel were edited and need to be pushed
  // back to it.
  originalName?: string;
  originalBrand?: string;
  originalReorderLevel?: number;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  purchasedAmount: number;
  sellingAmount: number;
}

const DRAFT_KEY = "draft:new-purchase-order";

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const { suppliers } = useSuppliers();
  const { createPurchase } = usePurchases();

  const [supplierId, setSupplierId] = useState("");
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [items, setItems] = useState<ItemRow[]>([]);
  const [newProductOpen, setNewProductOpen] = useState(false);
  const [newProductSeed, setNewProductSeed] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [draftSavedFlash, setDraftSavedFlash] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  const submitRef = useRef<HTMLButtonElement>(null);
  // Set right after adding a product, so a (post-render) effect can move
  // keyboard focus straight onto that new row.
  const [pendingFocusKey, setPendingFocusKey] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (!saved) return;
    try {
      const draft = JSON.parse(saved);
      if (draft.items?.length || draft.supplierId) {
        setSupplierId(draft.supplierId || "");
        setOrderDate(draft.orderDate || orderDate);
        setExpectedDelivery(draft.expectedDelivery || "");
        setItems(draft.items || []);
        setDraftRestored(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ supplierId, orderDate, expectedDelivery, items }));
  }, [supplierId, orderDate, expectedDelivery, items]);

  useEffect(() => {
    if (!pendingFocusKey) return;
    const index = items.findIndex((row) => row.key === pendingFocusKey);
    rowRefs.current[index]?.focus();
    setPendingFocusKey(null);
  }, [items, pendingFocusKey]);

  function clearDraft() { localStorage.removeItem(DRAFT_KEY); }
  function handleSaveDraft() {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ supplierId, orderDate, expectedDelivery, items }));
    setDraftSavedFlash(true);
    setTimeout(() => setDraftSavedFlash(false), 2000);
  }
  function discardDraft() {
    clearDraft();
    setSupplierId(""); setExpectedDelivery(""); setItems([]);
    setDraftRestored(false);
  }

  function addExistingProduct(product: Product) {
    const key = crypto.randomUUID();
    setItems((prev) => [...prev, {
      key,
      productId: product.id,
      name: product.name,
      brand: product.brand,
      barcode: product.barcode ?? undefined,
      categoryId: product.categoryId,
      reorderLevel: product.reorderLevel,
      originalName: product.name,
      originalBrand: product.brand,
      originalReorderLevel: product.reorderLevel,
      batchNumber: "", expiryDate: "", quantity: 0, purchasedAmount: 0, sellingAmount: 0,
    }]);
    setPendingFocusKey(key);
  }

  function addNewProduct(result: NewProductBatchResult) {
    const key = crypto.randomUUID();
    setItems((prev) => [...prev, {
      key,
      productId: null,
      name: result.name,
      brand: result.brand,
      barcode: result.barcode,
      categoryId: result.categoryId,
      reorderLevel: result.reorderLevel,
      batchNumber: result.batchNumber, expiryDate: result.expiryDate,
      quantity: result.quantity, purchasedAmount: result.purchasedAmount, sellingAmount: result.sellingAmount,
    }]);
    setPendingFocusKey(key);
  }

  function saveEdit(fields: EditableItemFields) {
    if (!editingKey) return;
    setItems((prev) => prev.map((row) => (row.key === editingKey ? { ...row, ...fields } : row)));
  }

  function removeRow(key: string) {
    setItems((prev) => prev.filter((row) => row.key !== key));
  }

  // Rows aren't inline-editable (details live in the Edit dialog), so arrow keys
  // move a row "selection" instead of moving between fields: ↑/↓ change which row
  // has focus, Enter opens it for editing, Delete removes it. Above the first row
  // goes back to search; below the last row continues to the submit button.
  function handleRowKeyDown(e: React.KeyboardEvent<HTMLTableRowElement>, index: number) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (index + 1 < items.length) rowRefs.current[index + 1]?.focus();
        else submitRef.current?.focus();
        break;
      case "ArrowUp":
        e.preventDefault();
        if (index > 0) rowRefs.current[index - 1]?.focus();
        else searchRef.current?.focus();
        break;
      case "Enter":
        e.preventDefault();
        setEditingKey(items[index].key);
        break;
      case "Delete":
        e.preventDefault();
        removeRow(items[index].key);
        break;
    }
  }

  function rowPrices(row: ItemRow) {
    if (row.quantity <= 0) return { purchasePrice: 0, sellingPrice: 0 };
    return {
      purchasePrice: row.purchasedAmount / row.quantity,
      sellingPrice: row.sellingAmount / row.quantity,
    };
  }

  const total = items.reduce((sum, row) => sum + row.purchasedAmount, 0);
  const editingRow = items.find((r) => r.key === editingKey) ?? null;

  async function handleSubmit() {
    if (submitting) return;
    if (!supplierId) return setError("Select a supplier.");
    if (items.length === 0) return setError("Add at least one item.");
    if (items.some((r) => !r.batchNumber.trim() || !r.expiryDate || r.quantity <= 0 || !r.purchasedAmount || !r.sellingAmount)) {
      return setError("Every item needs a batch number, expiry date, quantity, purchased amount, and selling amount.");
    }

    setSubmitting(true);
    setError(null);
    try {
      await createPurchase({
        supplierId, orderDate, expectedDelivery: expectedDelivery || undefined,
        items: items.map((r) => {
          const base = {
            batchNumber: r.batchNumber, expiryDate: r.expiryDate,
            quantity: r.quantity, purchasedAmount: r.purchasedAmount, sellingAmount: r.sellingAmount,
          };

          if (r.productId === null) {
            return {
              ...base,
              newProduct: {
                name: r.name, brand: r.brand, barcode: r.barcode, categoryId: r.categoryId,
                reorderLevel: r.reorderLevel,
              },
            };
          }

          const productUpdates: { name?: string; brand?: string; reorderLevel?: number } = {};
          if (r.originalName !== undefined && r.name !== r.originalName) productUpdates.name = r.name;
          if (r.originalBrand !== undefined && r.brand !== r.originalBrand) productUpdates.brand = r.brand;
          if (r.originalReorderLevel !== undefined && r.reorderLevel !== r.originalReorderLevel) {
            productUpdates.reorderLevel = r.reorderLevel;
          }

          return {
            ...base,
            productId: r.productId,
            ...(Object.keys(productUpdates).length > 0 ? { productUpdates } : {}),
          };
        }),
      });
      clearDraft();
      router.push("/purchases");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create purchase order.");
    } finally {
      setSubmitting(false);
    }
  }

  // Global, page-scoped shortcuts — F-keys fire even while typing since they
  // never collide with normal text entry.
  useKeyboardShortcut("F2", discardDraft, { allowInInputs: true });
  useKeyboardShortcut("F4", () => searchRef.current?.focus(), { allowInInputs: true });
  useKeyboardShortcut("F9", () => { handleSubmit(); }, { allowInInputs: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New purchase order</h1>
        <p className="text-sm text-muted-foreground">
          Order stock in bulk from a supplier — <kbd className="rounded border px-1">F2</kbd> clear order ·{" "}
          <kbd className="rounded border px-1">F4</kbd> focus search · <kbd className="rounded border px-1">F9</kbd> create order
        </p>
      </div>

      {draftRestored && (
        <div className="flex items-center justify-between rounded-md bg-blue-50 px-4 py-2 text-sm text-blue-700">
          <span>Restored your unsaved order from last time.</span>
          <button onClick={discardDraft} className="font-medium underline">Discard</button>
        </div>
      )}

      <div className="space-y-4 rounded-lg border bg-white p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Supplier</Label>
            <SupplierCombobox suppliers={suppliers} value={supplierId} onChange={setSupplierId} />
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
        <h2 className="font-semibold">Order items</h2>

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <ProductPicker
            ref={searchRef}
            onSelect={addExistingProduct}
            onCreateNew={(seed) => { setNewProductSeed(seed); setNewProductOpen(true); }}
          />
        </div>

        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">Scan a barcode or search above to add items.</p>
        )}

        {items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-2">Product</th>
                  <th className="py-2 pr-2">Batch #</th>
                  <th className="py-2 pr-2">Expiry</th>
                  <th className="py-2 pr-2">Qty</th>
                  <th className="py-2 pr-2">Purchased amount</th>
                  <th className="py-2 pr-2">Purchase price</th>
                  <th className="py-2 pr-2">Selling amount</th>
                  <th className="py-2 pr-2">Selling price</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((row, index) => {
                  const { purchasePrice, sellingPrice } = rowPrices(row);
                  return (
                    <tr
                      key={row.key}
                      ref={(el) => { rowRefs.current[index] = el; }}
                      tabIndex={0}
                      onKeyDown={(e) => handleRowKeyDown(e, index)}
                      className={cn(
                        "border-b outline-none last:border-0",
                        "focus:bg-blue-50 focus:ring-2 focus:ring-inset focus:ring-blue-400"
                      )}
                    >
                      <td className="py-2 pr-2 whitespace-nowrap">
                        <div className="font-medium">{row.name}</div>
                        <div className="text-xs text-muted-foreground">{row.brand}</div>
                      </td>
                      <td className="py-2 pr-2 whitespace-nowrap">{row.batchNumber || "—"}</td>
                      <td className="py-2 pr-2 whitespace-nowrap">{row.expiryDate || "—"}</td>
                      <td className="py-2 pr-2">{row.quantity || "—"}</td>
                      <td className="py-2 pr-2 whitespace-nowrap">{row.purchasedAmount ? formatCurrency(row.purchasedAmount) : "—"}</td>
                      <td className="py-2 pr-2 whitespace-nowrap text-muted-foreground">{row.quantity > 0 ? formatCurrency(purchasePrice) : "—"}</td>
                      <td className="py-2 pr-2 whitespace-nowrap">{row.sellingAmount ? formatCurrency(row.sellingAmount) : "—"}</td>
                      <td className="py-2 pr-2 whitespace-nowrap text-muted-foreground">{row.quantity > 0 ? formatCurrency(sellingPrice) : "—"}</td>
                      <td className="py-2 whitespace-nowrap">
                        <Button variant="ghost" size="icon" onClick={() => setEditingKey(row.key)} aria-label="Edit item">
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => removeRow(row.key)} aria-label="Remove item">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Tip: use ↑ ↓ to move between items, Enter to edit, Delete to remove.
              ↓ from the last row continues to Create purchase order.
            </p>
          </div>
        )}

        <div className="flex justify-end border-t pt-4">
          <div className="flex w-64 justify-between text-sm font-semibold">
            <span>Total (paid to supplier)</span><span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center justify-end gap-2">
        {draftSavedFlash && <span className="text-sm text-green-600">Draft saved</span>}
        <Button variant="outline" onClick={() => router.push("/purchases")}>Cancel</Button>
        <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50" onClick={handleSaveDraft}>Save draft</Button>
        <Button
          ref={submitRef}
          className="bg-blue-600 text-white hover:bg-blue-700"
          onClick={handleSubmit}
          disabled={submitting}
          onKeyDown={(e) => { if (e.key === "ArrowUp") { e.preventDefault(); rowRefs.current[items.length - 1]?.focus(); } }}
        >
          {submitting ? "Saving..." : "Create purchase order (F9)"}
        </Button>
      </div>

      <NewProductWithBatchDialog open={newProductOpen} onOpenChange={setNewProductOpen} initialValue={newProductSeed} onCreated={addNewProduct} />
      <EditPurchaseItemDialog
        open={editingKey !== null}
        onOpenChange={(open) => { if (!open) setEditingKey(null); }}
        item={editingRow}
        onSave={saveEdit}
      />
    </div>
  );
}
