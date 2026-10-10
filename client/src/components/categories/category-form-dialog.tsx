"use client";

import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Category } from "@/types/category";
import { useFieldChainNav } from "@/hooks/use-field-chain-nav";

type CategoryFormValues = Pick<Category, "name" | "description">;

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  initialData?: Category | null;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
}

const emptyForm: CategoryFormValues = { name: "", description: "" };

export function CategoryFormDialog({ open, onOpenChange, mode, initialData, onSubmit }: CategoryFormDialogProps) {
  const [form, setForm] = useState<CategoryFormValues>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(initialData ? { name: initialData.name, description: initialData.description } : emptyForm);
      setError(null);
    }
  }, [open, initialData]);

  const [submitting, setSubmitting] = useState(false);
  // 0 name, 1 submit button. Description is a Textarea, deliberately left out of
  // the chain (see hook comment).
  const { registerRef, handleKeyDown } = useFieldChainNav(2);

  async function handleSubmit() {
    if (!form.name.trim()) {
      setError("Category name is required.");
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add new category" : "Edit category"}</DialogTitle>
          <DialogDescription>
            {mode === "add" ? "Create a new category for organizing medicines" : "Update the category details"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="categoryName">Category name</Label>
            <Input
              ref={registerRef(0)}
              id="categoryName"
              placeholder="Enter category name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              onKeyDown={handleKeyDown(0)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="categoryDescription">Description</Label>
            <Textarea
              id="categoryDescription"
              placeholder="Enter category description"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <DialogFooter>
          <Button ref={registerRef(1)} onClick={handleSubmit} onKeyDown={handleKeyDown(1)} disabled={submitting}>
            {submitting ? "Saving..." : mode === "add" ? "Add category" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}