"use client";

import { useCallback, useEffect, useState } from "react";
import { Category } from "@/types/category";
import { categoriesApi } from "@/lib/api/categories";

type CategoryInput = Pick<Category, "name" | "description">;

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setCategories(await categoriesApi.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  async function addCategory(data: CategoryInput) {
    const created = await categoriesApi.create(data);
    setCategories((prev) => [...prev, { ...created, medicineCount: 0 }]);
  }

  async function updateCategory(id: string, data: CategoryInput) {
    const updated = await categoriesApi.update(id, data);
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
  }

  async function deleteCategory(id: string) {
    await categoriesApi.remove(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  return { categories, loading, error, addCategory, updateCategory, deleteCategory, refetch: fetchCategories };
}