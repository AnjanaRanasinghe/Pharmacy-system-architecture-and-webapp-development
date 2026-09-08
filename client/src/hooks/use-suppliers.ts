"use client";

import { useCallback, useEffect, useState } from "react";
import { Supplier } from "@/types/supplier";
import { suppliersApi } from "@/lib/api/suppliers";

type SupplierInput = Omit<Supplier, "id" | "totalPurchases">;

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setSuppliers(await suppliersApi.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  async function addSupplier(data: SupplierInput) {
    const created = await suppliersApi.create(data);
    setSuppliers((prev) => [...prev, { ...created, totalPurchases: 0 }]);
  }
  async function updateSupplier(id: string, data: SupplierInput) {
    const updated = await suppliersApi.update(id, data);
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
  }
  async function deleteSupplier(id: string) {
    await suppliersApi.remove(id);
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  }

  return { suppliers, loading, error, addSupplier, updateSupplier, deleteSupplier, refetch: fetchSuppliers };
}