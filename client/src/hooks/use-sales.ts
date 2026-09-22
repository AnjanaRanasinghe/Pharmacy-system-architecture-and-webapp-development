"use client";

import { useCallback, useEffect, useState } from "react";
import { Sale } from "@/types/sale";
import { salesApi, CreateSaleInput } from "@/lib/api/sales";

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setSales(await salesApi.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sales");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  async function createSale(data: CreateSaleInput) {
    const created = await salesApi.create(data);
    setSales((prev) => [created, ...prev]);
    return created;
  }

  return { sales, loading, error, createSale, refetch: fetchSales };
}
