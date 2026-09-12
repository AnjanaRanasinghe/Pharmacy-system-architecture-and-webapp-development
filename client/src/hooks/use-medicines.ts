"use client";

import { useCallback, useEffect, useState } from "react";
import { ProductInventoryRow } from "@/types/product";
import { productsApi } from "@/lib/api/products";

export function useMedicines() {
  const [medicines, setMedicines] = useState<ProductInventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedicines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setMedicines(await productsApi.inventory());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load medicines");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMedicines(); }, [fetchMedicines]);

  async function deleteMedicine(id: string) {
    const result = await productsApi.remove(id);
    setMedicines((prev) => prev.filter((m) => m.id !== id));
    return result;
  }

  return { medicines, loading, error, deleteMedicine, refetch: fetchMedicines };
}