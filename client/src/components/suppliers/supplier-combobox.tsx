"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Supplier } from "@/types/supplier";

interface SupplierComboboxProps {
  suppliers: Supplier[];
  value: string;
  onChange: (id: string) => void;
  // Quick-adds a supplier by name only (the rest of its details are filled in
  // later from the Suppliers page) and returns (at least) the created record's id.
  onCreate: (name: string) => Promise<{ id: string }>;
}

export function SupplierCombobox({ suppliers, value, onChange, onCreate }: SupplierComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selected = suppliers.find((s) => s.id === value);

  const trimmed = query.trim();
  const filtered = trimmed
    ? suppliers.filter((s) => s.name.toLowerCase().includes(trimmed.toLowerCase()))
    : suppliers;
  const exactMatch = suppliers.some((s) => s.name.toLowerCase() === trimmed.toLowerCase());

  function reset() {
    setQuery("");
    setError(null);
  }

  async function handleCreate() {
    if (!trimmed || creating) return;
    setCreating(true);
    setError(null);
    try {
      const created = await onCreate(trimmed);
      onChange(created.id);
      setOpen(false);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add supplier.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <PopoverTrigger
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-lg border border-input bg-white px-3 py-2",
          "text-sm shadow-xs outline-none transition-colors",
          "focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/30",
          !selected && "text-muted-foreground"
        )}
      >
        {selected ? selected.name : "Select supplier"}
        <ChevronsUpDown className="h-4 w-4 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search or add a supplier..." value={query} onValueChange={setQuery} />
          <CommandList>
            {filtered.length === 0 && !trimmed && (
              <p className="py-6 text-center text-sm text-muted-foreground">No suppliers yet.</p>
            )}
            {filtered.length > 0 && (
              <CommandGroup>
                {filtered.map((s) => (
                  <CommandItem key={s.id} value={s.id} onSelect={() => { onChange(s.id); setOpen(false); reset(); }}>
                    <Check className={cn("mr-2 h-4 w-4", value === s.id ? "opacity-100" : "opacity-0")} />
                    {s.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {trimmed && !exactMatch && (
              <CommandGroup>
                <CommandItem
                  value={`__create_supplier__${trimmed}`}
                  disabled={creating}
                  onSelect={handleCreate}
                  className="text-blue-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {creating ? "Adding..." : `Add "${trimmed}" as new supplier`}
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
          {error && <p className="px-3 pb-2 text-xs text-red-500">{error}</p>}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
