export interface PharmacySettings {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  licenseNumber: string | null;
  updatedAt: string;
}

export type UpdatePharmacySettingsInput = Omit<PharmacySettings, "id" | "updatedAt">;
