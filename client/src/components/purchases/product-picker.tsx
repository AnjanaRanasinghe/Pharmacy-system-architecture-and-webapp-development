"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { productsApi } from "@/lib/api/products";
import { Product } from "@/types/product";

interface ProductPickerProps {
  onSelect: (product: Product) => void;
  onCreateNew: (seed: string) => void;
}

export function ProductPicker({ onSelect, onCreateNew }: ProductPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try { setResults(await productsApi.search(query)); } finally { setLoading(false); }
    }, 250);
  }, [query]);

  function reset() { setQuery(""); setResults([]); setOpen(false); }

  async function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
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

    if (results.length === 1) {
      onSelect(results[0]);
      reset();
    }
  }

  return (
    <div className="relative">
      <Input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onKeyDown={handleKeyDown}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Scan barcode or search product..."
        autoFocus
        className="pl-9 border-gray-200 transition-colors focus-visible:border-green-500 focus-visible:ring-2 focus-visible:ring-green-500/30"
      />
      {open && query.trim() && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg">
          {loading && <p className="px-3 py-2 text-sm text-muted-foreground">Searching...</p>}
          {!loading && results.map((product) => (
            <button key={product.id} className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
              onMouseDown={() => { onSelect(product); reset(); }}>
              <span className="font-medium">{product.name}</span>{" "}
              <span className="text-muted-foreground">{product.brand}</span>
            </button>
          ))}
          {!loading && results.length === 0 && (
            <button className="block w-full px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50"
              onMouseDown={() => { onCreateNew(query.trim()); reset(); }}>
              + Add "{query.trim()}" as new product
            </button>
          )}
        </div>
      )}
    </div>
  );
}