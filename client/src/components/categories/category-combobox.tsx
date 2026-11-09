"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Category } from "@/types/category";

interface CategoryComboboxProps {
  categories: Category[];
  value: string;
  onChange: (id: string) => void;
  // Quick-adds a category by name only (description can be filled in later from
  // the Categories page) and returns (at least) the created record's id.
  onCreate: (name: string) => Promise<{ id: string }>;
}

export function CategoryCombobox({ categories, value, onChange, onCreate }: CategoryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selected = categories.find((c) => c.id === value);

  const trimmed = query.trim();
  const filtered = trimmed
    ? categories.filter((c) => c.name.toLowerCase().includes(trimmed.toLowerCase()))
    : categories;
  const exactMatch = categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase());

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
      setError(err instanceof Error ? err.message : "Could not add category.");
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
        {selected ? selected.name : "Select category"}
        <ChevronsUpDown className="h-4 w-4 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search or add a category..." value={query} onValueChange={setQuery} />
          <CommandList>
            {filtered.length === 0 && !trimmed && (
              <p className="py-6 text-center text-sm text-muted-foreground">No categories yet.</p>
            )}
            {filtered.length > 0 && (
              <CommandGroup>
                {filtered.map((c) => (
                  <CommandItem key={c.id} value={c.id} onSelect={() => { onChange(c.id); setOpen(false); reset(); }}>
                    <Check className={cn("mr-2 h-4 w-4", value === c.id ? "opacity-100" : "opacity-0")} />
                    {c.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {trimmed && !exactMatch && (
              <CommandGroup>
                <CommandItem
                  value={`__create_category__${trimmed}`}
                  disabled={creating}
                  onSelect={handleCreate}
                  className="text-blue-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {creating ? "Adding..." : `Add "${trimmed}" as new category`}
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
