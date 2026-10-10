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
import { useFieldChainNav } from "@/hooks/use-field-chain-nav";

type SupplierFormValues = Omit<Supplier, "id" | "totalPurchases">;

interface SupplierFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  initialData?: Supplier | null;
  onSubmit: (values: SupplierFormValues) => Promise<void>;
}

const emptyForm: SupplierFormValues = {
  name: "", contactPerson: "", phone: "", email: "", address: "", paymentTerms: "",
};

export function SupplierFormDialog({ open, onOpenChange, mode, initialData, onSubmit }: SupplierFormDialogProps) {
  const [form, setForm] = useState<SupplierFormValues>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // 0 name, 1 contactPerson, 2 phone, 3 email, 4 paymentTerms, 5 submit button.
  // Address is a Textarea, deliberately left out of the chain (see hook comment).
  const { registerRef, handleKeyDown } = useFieldChainNav(6);

  useEffect(() => {
    if (open) {
      setForm(initialData ? { ...initialData } : emptyForm);
      setError(null);
    }
  }, [open, initialData]);

  function handleChange<K extends keyof SupplierFormValues>(field: K, value: SupplierFormValues[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.contactPerson.trim() || !form.phone.trim() || !form.email.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(form);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
            <Input ref={registerRef(0)} id="supplierName" placeholder="Enter supplier name" value={form.name}
              onChange={(e) => handleChange("name", e.target.value)} onKeyDown={handleKeyDown(0)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contactPerson">Contact person</Label>
            <Input ref={registerRef(1)} id="contactPerson" placeholder="Enter contact name" value={form.contactPerson}
              onChange={(e) => handleChange("contactPerson", e.target.value)} onKeyDown={handleKeyDown(1)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input ref={registerRef(2)} id="phone" placeholder="+94 77-123-4567" value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)} onKeyDown={handleKeyDown(2)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input ref={registerRef(3)} id="email" type="email" placeholder="supplier@example.com" value={form.email}
              onChange={(e) => handleChange("email", e.target.value)} onKeyDown={handleKeyDown(3)} />
          </div>

          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" placeholder="Enter supplier address" value={form.address}
              onChange={(e) => handleChange("address", e.target.value)} />
          </div>

          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="paymentTerms">Payment terms</Label>
            <Input ref={registerRef(4)} id="paymentTerms" placeholder="e.g., Net 30, Net 45" value={form.paymentTerms}
              onChange={(e) => handleChange("paymentTerms", e.target.value)} onKeyDown={handleKeyDown(4)} />
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button ref={registerRef(5)} onClick={handleSubmit} onKeyDown={handleKeyDown(5)} disabled={submitting}>
            {submitting ? "Saving..." : mode === "add" ? "Add supplier" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}