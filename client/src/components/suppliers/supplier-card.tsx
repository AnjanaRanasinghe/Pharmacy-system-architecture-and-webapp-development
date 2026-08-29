import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Pencil, Trash2, Phone, Mail, MapPin } from "lucide-react";
import { Supplier } from "@/types/supplier";

interface SupplierCardProps {
  supplier: Supplier;
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
}

export function SupplierCard({ supplier, onEdit, onDelete }: SupplierCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">{supplier.name}</p>
              <p className="text-sm text-muted-foreground">{supplier.contactPerson}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" aria-label="Edit supplier" onClick={() => onEdit(supplier)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Delete supplier" onClick={() => onDelete(supplier.id)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {supplier.phone}</p>
          <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {supplier.email}</p>
          <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {supplier.address}</p>
        </div>

        <div className="mt-4 flex items-center justify-between border-t pt-3 text-sm">
          <div>
            <p className="text-muted-foreground">Payment terms</p>
            <p className="font-medium">{supplier.paymentTerms}</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground">Total purchases</p>
            <p className="font-semibold text-green-600">${supplier.totalPurchases.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}