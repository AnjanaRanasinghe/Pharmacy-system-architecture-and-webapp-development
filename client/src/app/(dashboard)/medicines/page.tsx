"use client";

import { useMemo, useState } from "react";
import { Calendar, Factory, Hash, Search, SlidersHorizontal, Tag, Tags, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MedicineTable } from "@/components/medicines/medicine-table";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useMedicines } from "@/hooks/use-medicines";
import { Product, ProductInventoryRow } from "@/types/product";
import { toDateInputValue } from "@/lib/utils/date";

const STATUS_OPTIONS = [
  { value: "IN_STOCK", label: "In stock" },
  { value: "LOW_STOCK", label: "Low stock" },
];

export default function MedicinesPage() {
  const { medicines, loading, error, deleteMedicine, refetch } = useMedicines();

  const [nameQuery, setNameQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [brandFilter, setBrandFilter] = useState("ALL");
  const [batchQuery, setBatchQuery] = useState("");
  const [expiryFilter, setExpiryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingMedicine, setDeletingMedicine] = useState<ProductInventoryRow | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);

  const categoryOptions = useMemo(
    () => Array.from(new Set(medicines.map((m) => m.category))).sort(),
    [medicines]
  );
  const brandOptions = useMemo(
    () => Array.from(new Set(medicines.map((m) => m.brand))).sort(),
    [medicines]
  );

  const filtered = useMemo(() => {
    const nameQueryLower = nameQuery.trim().toLowerCase();
    const batchQueryLower = batchQuery.trim().toLowerCase();
    return medicines.filter((m) => {
      if (nameQueryLower && !m.name.toLowerCase().includes(nameQueryLower)) return false;
      if (categoryFilter !== "ALL" && m.category !== categoryFilter) return false;
      if (brandFilter !== "ALL" && m.brand !== brandFilter) return false;
      if (batchQueryLower && !(m.primaryBatchNumber ?? "").toLowerCase().includes(batchQueryLower)) return false;
      if (expiryFilter) {
        if (!m.nearestExpiry) return false;
        if (toDateInputValue(new Date(m.nearestExpiry)) > expiryFilter) return false;
      }
      if (statusFilter !== "ALL") {
        const lowStock = m.totalQuantity <= m.reorderLevel;
        if (statusFilter === "LOW_STOCK" && !lowStock) return false;
        if (statusFilter === "IN_STOCK" && lowStock) return false;
      }
      return true;
    });
  }, [medicines, nameQuery, categoryFilter, brandFilter, batchQuery, expiryFilter, statusFilter]);

  const hasActiveFilters = Boolean(
    nameQuery || categoryFilter !== "ALL" || brandFilter !== "ALL" || batchQuery || expiryFilter || statusFilter !== "ALL"
  );

  function clearFilters() {
    setNameQuery("");
    setCategoryFilter("ALL");
    setBrandFilter("ALL");
    setBatchQuery("");
    setExpiryFilter("");
    setStatusFilter("ALL");
  }

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

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/60 p-2.5">
        <span className="flex items-center gap-1.5 pl-1 text-sm font-medium text-blue-700">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </span>

        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-blue-400" />
          <Input
            value={nameQuery}
            onChange={(e) => setNameQuery(e.target.value)}
            placeholder="Medicine name"
            className="h-9 w-40 rounded-lg border-blue-100 bg-white pl-8 pr-7 shadow-sm focus-visible:border-blue-400 focus-visible:ring-blue-200"
          />
          {nameQuery && (
            <button
              type="button"
              onClick={() => setNameQuery("")}
              aria-label="Clear medicine name filter"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? "ALL")}>
          <SelectTrigger className="h-9 gap-1.5 rounded-lg border-blue-100 bg-white px-2.5 shadow-sm">
            <Tags className="h-3.5 w-3.5 shrink-0 text-blue-400" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All categories</SelectItem>
            {categoryOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={brandFilter} onValueChange={(v) => setBrandFilter(v ?? "ALL")}>
          <SelectTrigger className="h-9 gap-1.5 rounded-lg border-blue-100 bg-white px-2.5 shadow-sm">
            <Factory className="h-3.5 w-3.5 shrink-0 text-blue-400" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All brands</SelectItem>
            {brandOptions.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>

        <div className="relative">
          <Hash className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-blue-400" />
          <Input
            value={batchQuery}
            onChange={(e) => setBatchQuery(e.target.value)}
            placeholder="Batch"
            className="h-9 w-28 rounded-lg border-blue-100 bg-white pl-8 pr-7 shadow-sm focus-visible:border-blue-400 focus-visible:ring-blue-200"
          />
          {batchQuery && (
            <button
              type="button"
              onClick={() => setBatchQuery("")}
              aria-label="Clear batch filter"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="relative">
          <Calendar className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-blue-400" />
          <Input
            type="date"
            value={expiryFilter}
            onChange={(e) => setExpiryFilter(e.target.value)}
            title="Show medicines expiring on or before this date"
            className="h-9 w-[9.5rem] rounded-lg border-blue-100 bg-white pl-8 shadow-sm focus-visible:border-blue-400 focus-visible:ring-blue-200"
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "ALL")}>
          <SelectTrigger className="h-9 gap-1.5 rounded-lg border-blue-100 bg-white px-2.5 shadow-sm">
            <Tag className="h-3.5 w-3.5 shrink-0 text-blue-400" />
            <SelectValue>
              {(value: string) => STATUS_OPTIONS.find((o) => o.value === value)?.label ?? "All statuses"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex h-9 items-center gap-1 rounded-lg px-2.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
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
          {medicines.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              No medicines yet — receive stock via a New Purchase Order to add your first one.
            </p>
          ) : filtered.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No medicines match the selected filters.</p>
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
