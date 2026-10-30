import { api } from "./client";
import { PharmacySettings, UpdatePharmacySettingsInput } from "@/types/settings";

export const settingsApi = {
  get: () => api.get<PharmacySettings>("/settings"),
  update: (data: UpdatePharmacySettingsInput) => api.put<PharmacySettings>("/settings", data),
};
