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
    return created;
  }

  // Quick-add used from inline "+ Add as new category" pickers — only a name,
  // no description. Still goes through the same create endpoint and local-state
  // update as addCategory, so it shows up immediately everywhere categories are
  // listed, including the next "add new product" dialog.
  function quickAddCategory(name: string) {
    return addCategory({ name, description: "" });
  }

  async function updateCategory(id: string, data: CategoryInput) {
    const updated = await categoriesApi.update(id, data);
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
  }

  async function deleteCategory(id: string) {
    await categoriesApi.remove(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  return { categories, loading, error, addCategory, quickAddCategory, updateCategory, deleteCategory, refetch: fetchCategories };
}