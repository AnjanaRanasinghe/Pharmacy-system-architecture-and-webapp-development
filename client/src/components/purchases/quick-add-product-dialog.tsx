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

interface QuickAddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue: string;
  onCreated: (product: Product) => void;
}

export function QuickAddProductDialog({ open, onOpenChange, initialValue, onCreated }: QuickAddProductDialogProps) {
  const { categories } = useCategories();
  const isBarcodeLike = /^[0-9]{6,}$/.test(initialValue);

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [barcode, setBarcode] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName(isBarcodeLike ? "" : initialValue);
      setBarcode(isBarcodeLike ? initialValue : "");
      setBrand(""); setCategoryId(""); setSellingPrice(""); setError(null);
    }
  }, [open, initialValue, isBarcodeLike]);

  async function handleSubmit() {
    if (!name.trim() || !categoryId || !sellingPrice) {
      setError("Name, category, and selling price are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const product = await productsApi.create({
        name: name.trim(),
        brand: brand.trim() || "Generic",
        barcode: barcode.trim() || undefined,
        categoryId,
        sellingPrice: Number(sellingPrice),
      });
      onCreated(product);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create product.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add new product</DialogTitle>
          <DialogDescription>
            {isBarcodeLike
              ? "This barcode isn't in the system yet — add the product it belongs to."
              : "No matching product found — add it now."}
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
          <div className="space-y-1.5">
            <Label>Selling price ($)</Label>
            <Input type="number" step="0.01" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} />
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>{submitting ? "Saving..." : "Add product"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}