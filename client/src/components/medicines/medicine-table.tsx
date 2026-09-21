"use client";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { StatusBadge } from "./status-badge";
import { ProductInventoryRow } from "@/types/product";
import { formatCurrency } from "@/lib/utils/currency";
import { AlertTriangle, Barcode, Pencil, Trash2 } from "lucide-react";

interface MedicineTableProps {
  medicines: ProductInventoryRow[];
  onEdit: (medicine: ProductInventoryRow) => void;
  onDelete: (id: string) => void;
}

export function MedicineTable({ medicines, onEdit, onDelete }: MedicineTableProps) {
  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Medicine name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Batch</TableHead>
            <TableHead>Purchase price</TableHead>
            <TableHead>Selling price</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Nearest expiry</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {medicines.map((m) => {
            const lowStock = m.totalQuantity <= m.reorderLevel;
            return (
              <TableRow key={m.id}>
                <TableCell className="font-medium">
                  <span className="flex items-center gap-1.5">
                    {m.name}
                    {lowStock && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                  </span>
                </TableCell>
                <TableCell><Badge variant="outline">{m.category}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{m.brand}</TableCell>
                <TableCell className="text-muted-foreground">
                  {m.batchCount === 0 ? "No stock" : m.batchCount === 1 ? m.primaryBatchNumber : `${m.batchCount} batches`}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {m.purchasePrice !== null ? formatCurrency(m.purchasePrice) : "—"}
                </TableCell>
                <TableCell>{formatCurrency(m.sellingPrice)}</TableCell>
                <TableCell className={lowStock ? "font-medium text-orange-500" : ""}>{m.totalQuantity}</TableCell>
                <TableCell className="text-muted-foreground">
                  {m.nearestExpiry ? new Date(m.nearestExpiry).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell><StatusBadge lowStock={lowStock} /></TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                        aria-label="View barcode">
                        <Barcode className="h-4 w-4" />
                      </TooltipTrigger>
                      <TooltipContent>{m.barcode}</TooltipContent>
                    </Tooltip>
                    <Button variant="ghost" size="icon" aria-label="Edit medicine" onClick={() => onEdit(m)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Delete medicine" onClick={() => onDelete(m.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TooltipProvider>
  );
}