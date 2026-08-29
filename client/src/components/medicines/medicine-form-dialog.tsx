"use client";

import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Medicine } from "@/types/medicine";
import { MEDICINE_CATEGORIES, SUPPLIERS } from "@/lib/constants/medicine-options";

type MedicineFormValues = Omit<Medicine, "id" | "batchNumber">;

interface MedicineFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  initialData?: Medicine | null;
  onSubmit: (values: MedicineFormValues) => void;
}

const emptyForm: MedicineFormValues = {
  name: "", brand: "", category: "", supplier: "", quantity: 0, price: 0, expiryDate: "", description: "",
};

export function MedicineFormDialog({ open, onOpenChange, mode, initialData, onSubmit }: MedicineFormDialogProps) {
  const [form, setForm] = useState<MedicineFormValues>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(initialData ? { ...initialData } : emptyForm);
      setError(null);
    }
  }, [open, initialData]);

  function handleChange<K extends keyof MedicineFormValues>(field: K, value: MedicineFormValues[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit() {
    if (!form.name.trim() || !form.brand.trim() || !form.category || !form.supplier || !form.expiryDate) {
      setError("Please fill in all required fields.");
      return;
    }
    if (form.quantity <= 0) {
      setError("Quantity must be greater than 0.");
      return;
    }
    onSubmit(form);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add new medicine" : "Edit medicine"}</DialogTitle>
          <DialogDescription>
            {mode === "add" ? "Enter the details of the new medicine" : "Update the medicine details"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Medicine name</Label>
            <Input id="name" placeholder="Enter medicine name" value={form.name}
              onChange={(e) => handleChange("name", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="brand">Brand</Label>
            <Input id="brand" placeholder="Enter brand name" value={form.brand}
              onChange={(e) => handleChange("brand", e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => handleChange("category", v)}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {MEDICINE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Supplier</Label>
            <Select value={form.supplier} onValueChange={(v) => handleChange("supplier", v)}>
              <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
              <SelectContent>
                {SUPPLIERS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="quantity">Quantity</Label>
            <Input id="quantity" type="number" min={0} placeholder="0" value={form.quantity || ""}
              onChange={(e) => handleChange("quantity", Number(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="price">Price ($)</Label>
            <Input id="price" type="number" min={0} step="0.01" placeholder="0.00" value={form.price || ""}
              onChange={(e) => handleChange("price", Number(e.target.value))} />
          </div>

          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="expiry">Expiry date</Label>
            <Input id="expiry" type="date" value={form.expiryDate}
              onChange={(e) => handleChange("expiryDate", e.target.value)} />
          </div>

          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Enter medicine description" value={form.description}
              onChange={(e) => handleChange("description", e.target.value)} />
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>{mode === "add" ? "Add medicine" : "Save changes"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}