"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProductInventoryRow } from "@/types/product";
import { cn } from "@/lib/utils";

interface MedicineSearchBarProps {
  medicines: ProductInventoryRow[];
  onAdd: (medicine: ProductInventoryRow) => void;
}

export const MedicineSearchBar = forwardRef<HTMLInputElement, MedicineSearchBarProps>(function MedicineSearchBar(
  { medicines, onAdd },
  forwardedRef
) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement);

  const q = query.trim().toLowerCase();
  const results = q
    ? medicines.filter((m) => [m.name, m.brand, m.barcode].some((f) => f?.toLowerCase().includes(q))).slice(0, 8)
    : [];

  function reset() {
    setQuery("");
    setOpen(false);
    setHighlighted(0);
  }

  function addIfInStock(medicine: ProductInventoryRow) {
    if (medicine.totalQuantity <= 0) return;
    onAdd(medicine);
    reset();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (results.length > 0) setHighlighted((i) => Math.min(i + 1, results.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length > 0) setHighlighted((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      reset();
      return;
    }
    if (e.key !== "Enter") return;
    e.preventDefault();
    const scanned = query.trim();
    if (!scanned) return;

    // Scanner workflow: an exact barcode match always wins, regardless of what's highlighted.
    const exactBarcode = medicines.find((m) => m.barcode === scanned);
    if (exactBarcode) {
      addIfInStock(exactBarcode);
      return;
    }

    if (results.length > 0) {
      addIfInStock(results[highlighted] ?? results[0]);
    }
  }

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setHighlighted(0); }}
        onKeyDown={handleKeyDown}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Scan barcode or search medicine by name..."
        autoFocus
        className="pl-9"
      />
      {open && q && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg">
          {results.map((m, i) => {
            const outOfStock = m.totalQuantity <= 0;
            return (
              <button
                key={m.id}
                disabled={outOfStock}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50",
                  i === highlighted && "bg-blue-50"
                )}
                onMouseEnter={() => setHighlighted(i)}
                onMouseDown={() => addIfInStock(m)}
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
});
