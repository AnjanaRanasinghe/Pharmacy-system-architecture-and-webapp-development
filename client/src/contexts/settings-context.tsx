"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { PharmacySettings, UpdatePharmacySettingsInput } from "@/types/settings";
import { settingsApi } from "@/lib/api/settings";

interface SettingsContextValue {
  settings: PharmacySettings | null;
  loading: boolean;
  error: string | null;
  updateSettings: (data: UpdatePharmacySettingsInput) => Promise<PharmacySettings>;
  refetch: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

// A single shared instance so every consumer (sidebar, invoice print, report export,
// the Settings page itself) sees an edit immediately — independent hook instances
// would each hold their own stale copy until their own next fetch.
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PharmacySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setSettings(await settingsApi.get());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  async function updateSettings(data: UpdatePharmacySettingsInput) {
    const updated = await settingsApi.update(data);
    setSettings(updated);
    return updated;
  }

  return (
    <SettingsContext.Provider value={{ settings, loading, error, updateSettings, refetch: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within a SettingsProvider");
  return ctx;
}
