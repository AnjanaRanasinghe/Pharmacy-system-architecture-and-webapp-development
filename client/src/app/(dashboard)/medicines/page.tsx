"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MedicineTable } from "@/components/medicines/medicine-table";
import { MedicineFormDialog } from "@/components/medicines/medicine-form-dialog";
import { useMedicines } from "@/hooks/use-medicines";
import { Medicine } from "@/types/medicine";

export default function MedicinesPage() {
  const { medicines, addMedicine, updateMedicine, deleteMedicine } = useMedicines();
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  const filtered = medicines.filter((m) =>
    [m.name, m.brand, m.category].some((field) => field.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Medicine management</h1>
          <p className="text-sm text-muted-foreground">Manage your medicine inventory</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Add medicine
        </Button>
      </div>

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

        <MedicineTable medicines={filtered} onEdit={setEditingMedicine} onDelete={deleteMedicine} />
      </div>

      <MedicineFormDialog mode="add" open={isAddOpen} onOpenChange={setIsAddOpen} onSubmit={addMedicine} />

      <MedicineFormDialog
        mode="edit"
        open={editingMedicine !== null}
        onOpenChange={(open) => !open && setEditingMedicine(null)}
        initialData={editingMedicine}
        onSubmit={(values) => {
          if (editingMedicine) updateMedicine(editingMedicine.id, values);
        }}
      />
    </div>
  );
}