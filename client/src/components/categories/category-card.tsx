import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Network, Pencil, Trash2 } from "lucide-react";
import { Category } from "@/types/category";

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Network className="h-5 w-5" />
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" aria-label="Edit category" onClick={() => onEdit(category)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Delete category" onClick={() => onDelete(category.id)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>

        <h3 className="mt-4 font-semibold">{category.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>

        <div className="mt-4 flex items-center justify-between border-t pt-3 text-sm">
          <span className="text-muted-foreground">Medicines</span>
          <span className="font-semibold text-blue-600">{category.medicineCount}</span>
        </div>
      </CardContent>
    </Card>
  );
}