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
import { productsApi } from "@/lib/api/products";
import { Product } from "@/types/product";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  initialValue?: string;
  initialData?: Product | null;
  onSaved: (product: Product) => void;
}

export function ProductFormDialog({ open, onOpenChange, mode, initialValue = "", initialData, onSaved }: ProductFormDialogProps) {
  const { categories } = useCategories();
  const isBarcodeLike = /^[0-9]{6,}$/.test(initialValue);

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [barcode, setBarcode] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [reorderLevel, setReorderLevel] = useState("20");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initialData) {
      setName(initialData.name);
      setBrand(initialData.brand);
      setBarcode(initialData.barcode || "");
      setCategoryId(initialData.categoryId);
      setSellingPrice(String(initialData.sellingPrice));
      setReorderLevel(String(initialData.reorderLevel ?? 20));
    } else {
      setName(isBarcodeLike ? "" : initialValue);
      setBrand("");
      setBarcode(isBarcodeLike ? initialValue : "");
      setCategoryId("");
      setSellingPrice("");
      setReorderLevel("20");
    }
    setError(null);
  }, [open, mode, initialData, initialValue, isBarcodeLike]);

  async function handleSubmit() {
    if (!name.trim() || !categoryId || !sellingPrice) {
      setError("Name, category, and selling price are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        name: name.trim(),
        brand: brand.trim() || "Generic",
        barcode: barcode.trim() || undefined,
        categoryId,
        sellingPrice: Number(sellingPrice),
        reorderLevel: Number(reorderLevel) || 20,
      };
      const saved =
        mode === "edit" && initialData
          ? await productsApi.update(initialData.id, payload)
          : await productsApi.create(payload);
      onSaved(saved);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save product.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit medicine" : "Add new medicine"}</DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update this product's details"
              : isBarcodeLike
              ? "This barcode isn't in the system yet — add the product it belongs to."
              : "Enter the details of the new medicine"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Product name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Paracetamol 500mg" />
          </div>
          <div className="space-y-1.5">
            <Label>Brand</Label>
            <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Leave blank if generic" />
          </div>
          <div className="space-y-1.5">
            <Label>Barcode</Label>
            <Input value={barcode} onChange={(e) => setBarcode(e.target.value)}
              placeholder="Leave blank to auto-generate an internal code" />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Selling price (Rs.)</Label>
              <Input type="number" step="0.01" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Reorder level</Label>
              <Input type="number" min={0} value={reorderLevel} onChange={(e) => setReorderLevel(e.target.value)} />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving..." : mode === "edit" ? "Save changes" : "Add medicine"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}