"use client";

import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/hooks/use-categories";
import { formatCurrency } from "@/lib/utils/currency";

export interface NewProductBatchResult {
  name: string;
  brand: string;
  barcode?: string;
  categoryId: string;
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
  const { categories } = useCategories();
  const isBarcodeLike = /^[0-9]{6,}$/.test(initialValue);

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [barcode, setBarcode] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [quantity, setQuantity] = useState("");
  const [purchasedAmount, setPurchasedAmount] = useState("");
  const [sellingAmount, setSellingAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(isBarcodeLike ? "" : initialValue);
    setBrand("");
    setBarcode(isBarcodeLike ? initialValue : "");
    setCategoryId(""); setBatchNumber(""); setExpiryDate("");
    setQuantity(""); setPurchasedAmount(""); setSellingAmount("");
    setError(null);
  }, [open, initialValue, isBarcodeLike]);

  const qtyNum = Number(quantity) || 0;
  const purchasePrice = qtyNum > 0 ? Number(purchasedAmount) / qtyNum : 0;
  const sellingPrice = qtyNum > 0 ? Number(sellingAmount) / qtyNum : 0;

  function handleSubmit() {
    if (!name.trim() || !categoryId || !batchNumber.trim() || !expiryDate || qtyNum <= 0 || !purchasedAmount || !sellingAmount) {
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
      batchNumber: batchNumber.trim(),
      expiryDate,
      quantity: qtyNum,
      purchasedAmount: Number(purchasedAmount),
      sellingAmount: Number(sellingAmount),
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
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Paracetamol 500mg" />
          </div>
          <div className="space-y-1.5">
            <Label>Brand</Label>
            <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Leave blank if generic" />
          </div>
          <div className="space-y-1.5">
            <Label>Barcode</Label>
            <Input value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="Auto-generated if blank" />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2 border-t pt-4 text-sm font-medium text-muted-foreground">This shipment</div>

          <div className="space-y-1.5">
            <Label>Batch #</Label>
            <Input value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Expiry date</Label>
            <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Quantity</Label>
            <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g. 100 tablets" />
          </div>
          <div />

          <div className="space-y-1.5">
            <Label>Purchased amount (Rs.)</Label>
            <Input type="number" min={0} step="0.01" value={purchasedAmount} onChange={(e) => setPurchasedAmount(e.target.value)} placeholder="Total you paid" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground">Purchase price / unit</Label>
            <div className="flex h-9 items-center rounded-md border bg-gray-50 px-3 text-sm text-muted-foreground">
              {qtyNum > 0 ? formatCurrency(purchasePrice) : "—"}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Selling amount (Rs.)</Label>
            <Input type="number" min={0} step="0.01" value={sellingAmount} onChange={(e) => setSellingAmount(e.target.value)} placeholder="Total resale value" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground">Selling price / unit</Label>
            <div className="flex h-9 items-center rounded-md border bg-gray-50 px-3 text-sm text-muted-foreground">
              {qtyNum > 0 ? formatCurrency(sellingPrice) : "—"}
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Add item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
