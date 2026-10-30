"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MedicineTable } from "@/components/medicines/medicine-table";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useMedicines } from "@/hooks/use-medicines";
import { Product, ProductInventoryRow } from "@/types/product";

export default function MedicinesPage() {
  const { medicines, loading, error, deleteMedicine, refetch } = useMedicines();
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingMedicine, setDeletingMedicine] = useState<ProductInventoryRow | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);

  const filtered = medicines.filter((m) =>
    [m.name, m.brand, m.category].some((field) => field.toLowerCase().includes(search.toLowerCase()))
  );

  function openEditFromRow(row: ProductInventoryRow) {
    setEditingProduct({
      id: row.id, name: row.name, brand: row.brand, barcode: row.barcode,
      categoryId: row.categoryId, sellingPrice: row.sellingPrice, reorderLevel: row.reorderLevel,
    });
    setFormOpen(true);
  }

  function handleConfirmDelete() {
    if (!deletingMedicine) return;
    setDeleteError(null);
    setDeleteNotice(null);
    deleteMedicine(deletingMedicine.id)
      .then((result) => { if (result && "archived" in result && result.archived) setDeleteNotice(result.message ?? null); })
      .catch((err) => setDeleteError(err.message));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Medicine management</h1>
        <p className="text-sm text-muted-foreground">Manage your medicine inventory</p>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading medicines...</p>}

      {!loading && error && (
        <div className="space-y-3">
          <p className="text-sm text-red-500">Couldn't load medicines: {error}</p>
          <Button variant="outline" onClick={refetch}>Retry</Button>
        </div>
      )}

      {deleteError && <p className="text-sm text-red-500">{deleteError}</p>}
      {deleteNotice && <p className="text-sm text-blue-600">{deleteNotice}</p>}

      {!loading && !error && (
        <div className="rounded-lg border bg-white">
          <div className="border-b p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search medicines by name, brand, or category..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              {medicines.length === 0
                ? "No medicines yet — receive stock via a New Purchase Order to add your first one."
                : "No medicines match your search."}
            </p>
          ) : (
            <MedicineTable
              medicines={filtered}
              onEdit={openEditFromRow}
              onDelete={(id) => {
                const medicine = filtered.find((m) => m.id === id);
                if (!medicine) return;
                setDeleteError(null);
                setDeleteNotice(null);
                setDeletingMedicine(medicine);
              }}
            />
          )}
        </div>
      )}

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editingProduct}
        onSaved={() => refetch()}
      />

      <ConfirmDialog
        open={deletingMedicine !== null}
        onOpenChange={(open) => !open && setDeletingMedicine(null)}
        title="Delete medicine"
        description={`Delete "${deletingMedicine?.name}" (${deletingMedicine?.brand})? This can't be undone.`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}