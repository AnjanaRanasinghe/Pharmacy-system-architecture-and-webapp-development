"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/components/categories/category-card";
import { CategoryFormDialog } from "@/components/categories/category-form-dialog";
import { useCategories } from "@/hooks/use-categories";
import { Category } from "@/types/category";

export default function CategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Category management</h1>
          <p className="text-sm text-muted-foreground">Organize medicines into categories</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Add category
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onEdit={setEditingCategory}
            onDelete={deleteCategory}
          />
        ))}
      </div>

      <CategoryFormDialog mode="add" open={isAddOpen} onOpenChange={setIsAddOpen} onSubmit={addCategory} />

      <CategoryFormDialog
        mode="edit"
        open={editingCategory !== null}
        onOpenChange={(open) => !open && setEditingCategory(null)}
        initialData={editingCategory}
        onSubmit={(values) => {
          if (editingCategory) updateCategory(editingCategory.id, values);
        }}
      />
    </div>
  );
}