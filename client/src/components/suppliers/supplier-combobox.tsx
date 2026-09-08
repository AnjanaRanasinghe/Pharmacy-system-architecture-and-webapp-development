"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Supplier } from "@/types/supplier";

interface SupplierComboboxProps {
  suppliers: Supplier[];
  value: string;
  onChange: (id: string) => void;
}

export function SupplierCombobox({ suppliers, value, onChange }: SupplierComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = suppliers.find((s) => s.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
      <PopoverContent className="w-72 p-0">
        <Command>
          <div className="flex items-center gap-2 border-b px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <CommandInput placeholder="Search suppliers..." className="border-0 focus:ring-0" />
          </div>
          <CommandList>
            <CommandEmpty>No supplier found.</CommandEmpty>
            <CommandGroup>
              {suppliers.map((s) => (
                <CommandItem key={s.id} value={s.name} onSelect={() => { onChange(s.id); setOpen(false); }}>
                  <Check className={cn("mr-2 h-4 w-4", value === s.id ? "opacity-100" : "opacity-0")} />
                  {s.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}