"use client";

import { useState } from "react";
import { Category } from "@/types/category";

const initialCategories: Category[] = [
  { id: "1", name: "Pain Relief", description: "Medicines for pain management", medicineCount: 45 },
  { id: "2", name: "Antibiotics", description: "Antibacterial medications", medicineCount: 32 },
  { id: "3", name: "Antihistamine", description: "Allergy relief medications", medicineCount: 18 },
  { id: "4", name: "Vitamins", description: "Nutritional supplements", medicineCount: 67 },
  { id: "5", name: "Cardiac", description: "Heart and blood pressure medications", medicineCount: 24 },
  { id: "6", name: "Diabetes", description: "Blood sugar management", medicineCount: 15 },
];

type CategoryInput = Pick<Category, "name" | "description">;

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  function addCategory(data: CategoryInput) {
    // TODO: replace with `await api.post("/categories", data)` once the backend is ready
    setCategories((prev) => [...prev, { ...data, id: crypto.randomUUID(), medicineCount: 0 }]);
  }

  function updateCategory(id: string, data: CategoryInput) {
    // TODO: replace with `await api.put(`/categories/${id}`, data)`
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  }

  function deleteCategory(id: string) {
    // TODO: replace with `await api.delete(`/categories/${id}`)`
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  return { categories, addCategory, updateCategory, deleteCategory };
}