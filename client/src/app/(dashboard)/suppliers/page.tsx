"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SupplierCard } from "@/components/suppliers/supplier-card";
import { SupplierFormDialog } from "@/components/suppliers/supplier-form-dialog";
import { useSuppliers } from "@/hooks/use-suppliers";
import { Supplier } from "@/types/supplier";

export default function SuppliersPage() {
  const { suppliers, loading, error, addSupplier, updateSupplier, deleteSupplier, refetch } = useSuppliers();
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const filtered = suppliers.filter((s) =>
    [s.name, s.contactPerson, s.email].some((field) => field.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Supplier management</h1>
          <p className="text-sm text-muted-foreground">Manage your medicine suppliers</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Add supplier
        </Button>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading suppliers...</p>}

      {!loading && error && (
        <div className="space-y-3">
          <p className="text-sm text-red-500">Couldn't load suppliers: {error}</p>
          <Button variant="outline" onClick={refetch}>Retry</Button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search suppliers..."
              className="bg-white pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {suppliers.length === 0 ? "No suppliers yet — add your first one." : "No suppliers match your search."}
            </p>
          )}

          {filtered.length > 0 && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {filtered.map((supplier) => (
                <SupplierCard
                  key={supplier.id}
                  supplier={supplier}
                  onEdit={setEditingSupplier}
                  onDelete={(id) => deleteSupplier(id).catch((err) => alert(err.message))}
                />
              ))}
            </div>
          )}
        </>
      )}

      <SupplierFormDialog mode="add" open={isAddOpen} onOpenChange={setIsAddOpen} onSubmit={addSupplier} />

      <SupplierFormDialog
        mode="edit"
        open={editingSupplier !== null}
        onOpenChange={(open) => !open && setEditingSupplier(null)}
        initialData={editingSupplier}
        onSubmit={(values) => editingSupplier ? updateSupplier(editingSupplier.id, values) : Promise.resolve()}
      />
    </div>
  );
}