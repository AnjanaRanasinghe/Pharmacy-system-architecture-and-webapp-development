"use client";

import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CategoryCombobox } from "@/components/categories/category-combobox";
import { useCategories } from "@/hooks/use-categories";
import { formatCurrency } from "@/lib/utils/currency";
import { useFieldChainNav } from "@/hooks/use-field-chain-nav";

export interface NewProductBatchResult {
  name: string;
  brand: string;
  barcode?: string;
  categoryId: string;
  reorderLevel: number;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  purchasedAmount: number;
  sellingAmount: number;
}

interface NewProductWithBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue: string;
  onCreated: (result: NewProductBatchResult) => void;
}

export function NewProductWithBatchDialog({ open, onOpenChange, initialValue, onCreated }: NewProductWithBatchDialogProps) {
  const { categories, quickAddCategory } = useCategories();
  const isBarcodeLike = /^[0-9]{6,}$/.test(initialValue);

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [barcode, setBarcode] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [reorderLevel, setReorderLevel] = useState("20");
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  // Optional helper fields, front-end only — not part of the submitted result.
  // When both are filled with valid numbers, they calculate Quantity for you
  // (boxes x qty/box); products that don't come boxed just skip these and type
  // Quantity directly, which stays the only field that's actually required.
  const [boxCount, setBoxCount] = useState("");
  const [qtyPerBox, setQtyPerBox] = useState("");
  const [quantity, setQuantity] = useState("");
  // Supplier invoices quote a price per box (or per unit, for things that
  // aren't boxed, like bottles) — never a pre-totaled amount. So these are the
  // only typed price inputs; the total amounts and per-unit prices below are
  // always derived from them, never typed directly (keeps a single source of
  // truth for the math instead of two fields that could disagree).
  const [purchasePricePerBox, setPurchasePricePerBox] = useState("");
  const [sellingPricePerBox, setSellingPricePerBox] = useState("");
  const [error, setError] = useState<string | null>(null);
  // 0 name, 1 brand, 2 barcode, 3 reorderLevel, 4 batchNumber, 5 expiryDate,
  // 6 boxCount, 7 qtyPerBox, 8 quantity, 9 purchasePricePerBox,
  // 10 sellingPricePerBox, 11 Add item button. Category is a Select,
  // deliberately left out of the chain (see hook comment).
  const { registerRef, handleKeyDown } = useFieldChainNav(12);

  useEffect(() => {
    if (!open) return;
    setName(isBarcodeLike ? "" : initialValue);
    setBrand("");
    setBarcode(isBarcodeLike ? initialValue : "");
    setCategoryId(""); setReorderLevel("20"); setBatchNumber(""); setExpiryDate("");
    setBoxCount(""); setQtyPerBox("");
    setQuantity(""); setPurchasePricePerBox(""); setSellingPricePerBox("");
    setError(null);
  }, [open, initialValue, isBarcodeLike]);

  useEffect(() => {
    const boxes = Number(boxCount);
    const perBox = Number(qtyPerBox);
    if (boxCount && qtyPerBox && boxes > 0 && perBox > 0) {
      setQuantity(String(boxes * perBox));
    }
  }, [boxCount, qtyPerBox]);

  const qtyNum = Number(quantity) || 0;
  const boxesEntered = Number(boxCount) > 0;
  // Boxed: priced and bought per box, so the total is price x number of boxes.
  // Not boxed: each unit in Quantity was bought individually at that price.
  const priceUnitLabel = boxesEntered ? "box" : "unit";
  const priceMultiplier = boxesEntered ? Number(boxCount) : qtyNum;
  const purchasedAmount = priceMultiplier > 0 ? Number(purchasePricePerBox) * priceMultiplier : 0;
  const sellingAmount = priceMultiplier > 0 ? Number(sellingPricePerBox) * priceMultiplier : 0;
  const purchasePrice = qtyNum > 0 ? purchasedAmount / qtyNum : 0;
  const sellingPrice = qtyNum > 0 ? sellingAmount / qtyNum : 0;

  function handleSubmit() {
    if (!name.trim() || !categoryId || !batchNumber.trim() || !expiryDate || qtyNum <= 0 || !purchasePricePerBox || !sellingPricePerBox) {
      setError("All fields except brand and barcode are required, and quantity must be greater than 0.");
      return;
    }
    setError(null);
    // Nothing is saved to the database here — this just adds a draft line to the
    // order below. The product (and this batch) are only persisted when the whole
    // purchase order is submitted.
    onCreated({
      name: name.trim(),
      brand: brand.trim() || "Generic",
      barcode: barcode.trim() || undefined,
      categoryId,
      reorderLevel: Number(reorderLevel) || 20,
      batchNumber: batchNumber.trim(),
      expiryDate,
      quantity: qtyNum,
      purchasedAmount,
      sellingAmount,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add new product</DialogTitle>
          <DialogDescription>
            {isBarcodeLike ? "This barcode isn't in the system yet — add the product and this shipment's details." : "Add the product and this shipment's details."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5">
            <Label>Product name</Label>
            <Input ref={registerRef(0)} value={name} onChange={(e) => setName(e.target.value)} onKeyDown={handleKeyDown(0)} placeholder="e.g. Paracetamol 500mg" />
          </div>
          <div className="space-y-1.5">
            <Label>Brand</Label>
            <Input ref={registerRef(1)} value={brand} onChange={(e) => setBrand(e.target.value)} onKeyDown={handleKeyDown(1)} placeholder="Leave blank if generic" />
          </div>
          <div className="space-y-1.5">
            <Label>Barcode</Label>
            <Input ref={registerRef(2)} value={barcode} onChange={(e) => setBarcode(e.target.value)} onKeyDown={handleKeyDown(2)} placeholder="Auto-generated if blank" />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Category</Label>
            <CategoryCombobox categories={categories} value={categoryId} onChange={setCategoryId} onCreate={quickAddCategory} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Low stock alert level</Label>
            <Input
              ref={registerRef(3)}
              type="number" min={0} value={reorderLevel}
              onChange={(e) => setReorderLevel(e.target.value)}
              onKeyDown={handleKeyDown(3)}
              placeholder="e.g. 5 for slow-moving items, 100 for fast-moving ones"
            />
            <p className="text-xs text-muted-foreground">
              Flag this medicine as "Low stock" once quantity on hand drops to this number or below.
            </p>
          </div>

          <div className="col-span-2 border-t pt-4 text-sm font-medium text-muted-foreground">This shipment</div>

          <div className="space-y-1.5">
            <Label>Batch #</Label>
            <Input ref={registerRef(4)} value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} onKeyDown={handleKeyDown(4)} />
          </div>
          <div className="space-y-1.5">
            <Label>Expiry date</Label>
            <Input ref={registerRef(5)} type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} onKeyDown={handleKeyDown(5, { allowArrows: false })} />
          </div>
          <div className="col-span-2 grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>No. of boxes</Label>
              <Input ref={registerRef(6)} type="number" min={0} value={boxCount} onChange={(e) => setBoxCount(e.target.value)} onKeyDown={handleKeyDown(6)} placeholder="Optional" />
            </div>
            <div className="space-y-1.5">
              <Label>Qty per box</Label>
              <Input ref={registerRef(7)} type="number" min={0} value={qtyPerBox} onChange={(e) => setQtyPerBox(e.target.value)} onKeyDown={handleKeyDown(7)} placeholder="Optional" />
            </div>
            <div className="space-y-1.5">
              <Label>Quantity</Label>
              <Input ref={registerRef(8)} type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} onKeyDown={handleKeyDown(8)} placeholder="e.g. 100 tablets" />
            </div>
          </div>

          <div className="col-span-2 grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Purchase price / {priceUnitLabel}</Label>
              <Input ref={registerRef(9)} type="number" min={0} step="0.01" value={purchasePricePerBox} onChange={(e) => setPurchasePricePerBox(e.target.value)} onKeyDown={handleKeyDown(9)} placeholder="From supplier invoice" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground">Purchased amount</Label>
              <div className="flex h-9 items-center rounded-md border border-blue-100 bg-blue-50 px-3 text-sm text-muted-foreground">
                {purchasedAmount > 0 ? formatCurrency(purchasedAmount) : "—"}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground">Purchase price / unit</Label>
              <div className="flex h-9 items-center rounded-md border border-blue-100 bg-blue-50 px-3 text-sm text-muted-foreground">
                {qtyNum > 0 ? formatCurrency(purchasePrice) : "—"}
              </div>
            </div>
          </div>

          <div className="col-span-2 grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Selling price / {priceUnitLabel}</Label>
              <Input ref={registerRef(10)} type="number" min={0} step="0.01" value={sellingPricePerBox} onChange={(e) => setSellingPricePerBox(e.target.value)} onKeyDown={handleKeyDown(10)} placeholder="Retail price" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground">Selling amount</Label>
              <div className="flex h-9 items-center rounded-md border border-blue-100 bg-blue-50 px-3 text-sm text-muted-foreground">
                {sellingAmount > 0 ? formatCurrency(sellingAmount) : "—"}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground">Selling price / unit</Label>
              <div className="flex h-9 items-center rounded-md border border-blue-100 bg-blue-50 px-3 text-sm text-muted-foreground">
                {qtyNum > 0 ? formatCurrency(sellingPrice) : "—"}
              </div>
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button ref={registerRef(11)} onClick={handleSubmit} onKeyDown={handleKeyDown(11)}>Add item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
