"use client";

import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Supplier } from "@/types/supplier";

type SupplierFormValues = Omit<Supplier, "id" | "totalPurchases">;

interface SupplierFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  initialData?: Supplier | null;
  onSubmit: (values: SupplierFormValues) => void;
}

const emptyForm: SupplierFormValues = {
  name: "", contactPerson: "", phone: "", email: "", address: "", paymentTerms: "",
};

export function SupplierFormDialog({ open, onOpenChange, mode, initialData, onSubmit }: SupplierFormDialogProps) {
  const [form, setForm] = useState<SupplierFormValues>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(initialData ? { ...initialData } : emptyForm);
      setError(null);
    }
  }, [open, initialData]);

  function handleChange<K extends keyof SupplierFormValues>(field: K, value: SupplierFormValues[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit() {
    if (!form.name.trim() || !form.contactPerson.trim() || !form.phone.trim() || !form.email.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    onSubmit(form);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add new supplier" : "Edit supplier"}</DialogTitle>
          <DialogDescription>
            {mode === "add" ? "Enter the details of the new supplier" : "Update the supplier details"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="supplierName">Supplier name</Label>
            <Input id="supplierName" placeholder="Enter supplier name" value={form.name}
              onChange={(e) => handleChange("name", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contactPerson">Contact person</Label>
            <Input id="contactPerson" placeholder="Enter contact name" value={form.contactPerson}
              onChange={(e) => handleChange("contactPerson", e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" placeholder="+1 234-567-8900" value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="supplier@example.com" value={form.email}
              onChange={(e) => handleChange("email", e.target.value)} />
          </div>

          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" placeholder="Enter supplier address" value={form.address}
              onChange={(e) => handleChange("address", e.target.value)} />
          </div>

          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="paymentTerms">Payment terms</Label>
            <Input id="paymentTerms" placeholder="e.g., Net 30, Net 45" value={form.paymentTerms}
              onChange={(e) => handleChange("paymentTerms", e.target.value)} />
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>{mode === "add" ? "Add supplier" : "Save changes"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}