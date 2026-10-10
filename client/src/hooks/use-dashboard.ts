"use client";

import { useCallback, useEffect, useState } from "react";
import { Dashboard } from "@/types/dashboard";
import { dashboardApi } from "@/lib/api/dashboard";

export function useDashboard() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setDashboard(await dashboardApi.get());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  return { dashboard, loading, error, refetch: fetchDashboard };
}
