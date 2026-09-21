"use client";

import { useCallback, useEffect, useState } from "react";
import { Purchase } from "@/types/purchase";
import { purchasesApi, CreatePurchaseInput } from "@/lib/api/purchases";

export function usePurchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setPurchases(await purchasesApi.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load purchase orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPurchases(); }, [fetchPurchases]);

  async function createPurchase(data: CreatePurchaseInput) {
    const created = await purchasesApi.create(data);
    setPurchases((prev) => [created, ...prev]);
    return created;
  }

  return { purchases, loading, error, createPurchase, refetch: fetchPurchases };
}