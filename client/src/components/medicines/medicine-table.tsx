"use client";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./status-badge";
import { Medicine, getMedicineStatus } from "@/types/medicine";
import { AlertTriangle, QrCode, Pencil, Trash2 } from "lucide-react";

interface MedicineTableProps {
  medicines: Medicine[];
  onEdit: (medicine: Medicine) => void;
  onDelete: (id: string) => void;
}

export function MedicineTable({ medicines, onEdit, onDelete }: MedicineTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Medicine name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Brand</TableHead>
          <TableHead>Batch #</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Expiry</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {medicines.map((medicine) => {
          const status = getMedicineStatus(medicine.quantity);
          const isLow = status === "low-stock";
          return (
            <TableRow key={medicine.id}>
              <TableCell className="font-medium">
                <span className="flex items-center gap-1.5">
                  {medicine.name}
                  {isLow && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                </span>
              </TableCell>
              <TableCell><Badge variant="outline">{medicine.category}</Badge></TableCell>
              <TableCell className="text-muted-foreground">{medicine.brand}</TableCell>
              <TableCell className="text-muted-foreground">{medicine.batchNumber}</TableCell>
              <TableCell className={isLow ? "font-medium text-orange-500" : ""}>{medicine.quantity}</TableCell>
              <TableCell>${medicine.price.toFixed(2)}</TableCell>
              <TableCell className="text-muted-foreground">{medicine.expiryDate}</TableCell>
              <TableCell><StatusBadge status={status} /></TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" aria-label="View barcode">
                    <QrCode className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Edit medicine" onClick={() => onEdit(medicine)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Delete medicine" onClick={() => onDelete(medicine.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}