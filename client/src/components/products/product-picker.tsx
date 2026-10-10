"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { productsApi } from "@/lib/api/products";
import { Product } from "@/types/product";
import { cn } from "@/lib/utils";

interface ProductPickerProps {
  onSelect: (product: Product) => void;
  onCreateNew: (seed: string) => void;
}

export const ProductPicker = forwardRef<HTMLInputElement, ProductPickerProps>(function ProductPicker(
  { onSelect, onCreateNew },
  forwardedRef
) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setHighlighted(0); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const found = await productsApi.search(query);
        setResults(found);
        setHighlighted(0);
      } finally {
        setLoading(false);
      }
    }, 250);
  }, [query]);

  function reset() { setQuery(""); setResults([]); setOpen(false); setHighlighted(0); }

  // Navigable entries = search results, plus the "add as new" row when there are no results.
  const optionCount = results.length > 0 ? results.length : 1;
  // Defensive clamp: if `results` changed shape right as a key was pressed, this
  // keeps the highlighted row and what Enter actually selects always in sync.
  const safeHighlighted = Math.min(highlighted, Math.max(optionCount - 1, 0));

  async function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((i) => Math.min(i + 1, optionCount - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((i) => Math.max(i - 1, 0));
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

    try {
      const product = await productsApi.findByBarcode(scanned);
      onSelect(product);
      reset();
      return;
    } catch {
      // no exact barcode match — fall through
    }

    if (results.length > 0) {
      onSelect(results[safeHighlighted] ?? results[0]);
      reset();
    } else {
      onCreateNew(scanned);
      reset();
    }
  }

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onKeyDown={handleKeyDown}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Scan barcode or search product..."
        autoFocus
        className="h-11 w-full rounded-lg border-gray-200 pl-11 text-sm transition-colors focus-visible:border-green-500 focus-visible:ring-2 focus-visible:ring-green-500/30"
      />
      {open && query.trim() && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg">
          {loading && <p className="px-3 py-2 text-sm text-muted-foreground">Searching...</p>}
          {!loading && results.map((product, i) => (
            <button
              key={product.id}
              className={cn("block w-full px-3 py-2 text-left text-sm hover:bg-gray-50", i === safeHighlighted && "bg-blue-50")}
              onMouseEnter={() => setHighlighted(i)}
              onMouseDown={() => { onSelect(product); reset(); }}
            >
              <span className="font-medium">{product.name}</span>{" "}
              <span className="text-muted-foreground">{product.brand}</span>
            </button>
          ))}
          {!loading && results.length === 0 && (
            <button
              className={cn("block w-full px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50", safeHighlighted === 0 && "bg-blue-50")}
              onMouseEnter={() => setHighlighted(0)}
              onMouseDown={() => { onCreateNew(query.trim()); reset(); }}
            >
              + Add "{query.trim()}" as new product
            </button>
          )}
        </div>
      )}
    </div>
  );
});
