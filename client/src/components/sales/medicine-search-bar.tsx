"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProductInventoryRow } from "@/types/product";

interface MedicineSearchBarProps {
  medicines: ProductInventoryRow[];
  onAdd: (medicine: ProductInventoryRow) => void;
}

export function MedicineSearchBar({ medicines, onAdd }: MedicineSearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const q = query.trim().toLowerCase();
  const results = q
    ? medicines.filter((m) => [m.name, m.brand, m.barcode].some((f) => f?.toLowerCase().includes(q))).slice(0, 8)
    : [];

  function reset() {
    setQuery("");
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const scanned = query.trim();
    if (!scanned) return;

    const exactBarcode = medicines.find((m) => m.barcode === scanned);
    if (exactBarcode) {
      onAdd(exactBarcode);
      reset();
      return;
    }

    if (results.length === 1) {
      onAdd(results[0]);
      reset();
    }
  }

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onKeyDown={handleKeyDown}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Scan barcode or search medicine by name..."
        autoFocus
        className="pl-9"
      />
      {open && q && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg">
          {results.map((m) => {
            const outOfStock = m.totalQuantity <= 0;
            return (
              <button
                key={m.id}
                disabled={outOfStock}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                onMouseDown={() => { if (!outOfStock) { onAdd(m); reset(); } }}
              >
                <span>
                  <span className="font-medium">{m.name}</span>{" "}
                  <span className="text-muted-foreground">{m.brand}</span>
                </span>
                <span className="text-xs text-muted-foreground">
                  {outOfStock ? "Out of stock" : `Stock: ${m.totalQuantity}`}
                </span>
              </button>
            );
          })}
          {results.length === 0 && (
            <p className="px-3 py-2 text-sm text-muted-foreground">No matching medicine found.</p>
          )}
        </div>
      )}
    </div>
  );
}
