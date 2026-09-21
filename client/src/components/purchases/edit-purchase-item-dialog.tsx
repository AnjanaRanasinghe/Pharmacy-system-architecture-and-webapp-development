"use client";

import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/currency";

export interface EditableItemFields {
  name: string;
  brand: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  purchasedAmount: number;
  sellingAmount: number;
}

interface EditPurchaseItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: EditableItemFields | null;
  onSave: (fields: EditableItemFields) => void;
}

export function EditPurchaseItemDialog({ open, onOpenChange, item, onSave }: EditPurchaseItemDialogProps) {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [quantity, setQuantity] = useState("");
  const [purchasedAmount, setPurchasedAmount] = useState("");
  const [sellingAmount, setSellingAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !item) return;
    setName(item.name);
    setBrand(item.brand);
    setBatchNumber(item.batchNumber);
    setExpiryDate(item.expiryDate);
    setQuantity(item.quantity ? String(item.quantity) : "");
    setPurchasedAmount(item.purchasedAmount ? String(item.purchasedAmount) : "");
    setSellingAmount(item.sellingAmount ? String(item.sellingAmount) : "");
    setError(null);
  }, [open, item]);

  const qtyNum = Number(quantity) || 0;
  const purchasePrice = qtyNum > 0 ? Number(purchasedAmount) / qtyNum : 0;
  const sellingPrice = qtyNum > 0 ? Number(sellingAmount) / qtyNum : 0;

  function handleSave() {
    if (!name.trim() || !batchNumber.trim() || !expiryDate || qtyNum <= 0 || !purchasedAmount || !sellingAmount) {
      setError("All fields are required, and quantity must be greater than 0.");
      return;
    }
    onSave({
      name: name.trim(),
      brand: brand.trim() || "Generic",
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
          <DialogTitle>Edit item</DialogTitle>
          <DialogDescription>Update this line's product and shipment details.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5">
            <Label>Product name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Brand</Label>
            <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Leave blank if generic" />
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
            <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div />

          <div className="space-y-1.5">
            <Label>Purchased amount (Rs.)</Label>
            <Input type="number" min={0} step="0.01" value={purchasedAmount} onChange={(e) => setPurchasedAmount(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground">Purchase price / unit</Label>
            <div className="flex h-9 items-center rounded-md border bg-gray-50 px-3 text-sm text-muted-foreground">
              {qtyNum > 0 ? formatCurrency(purchasePrice) : "—"}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Selling amount (Rs.)</Label>
            <Input type="number" min={0} step="0.01" value={sellingAmount} onChange={(e) => setSellingAmount(e.target.value)} />
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
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
