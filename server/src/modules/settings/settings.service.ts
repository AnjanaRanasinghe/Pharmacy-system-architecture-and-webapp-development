import { prisma } from "../../config/db";

const SETTINGS_ID = "singleton";

const DEFAULTS = {
  id: SETTINGS_ID,
  name: "My Pharmacy",
  address: null,
  phone: null,
  whatsapp: null,
  email: null,
  licenseNumber: null,
};

interface UpdateSettingsInput {
  name: string;
  address?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  licenseNumber?: string | null;
}

export const settingsService = {
  async get() {
    return prisma.pharmacySettings.upsert({
      where: { id: SETTINGS_ID },
      update: {},
      create: DEFAULTS,
    });
  },

  async update(input: UpdateSettingsInput) {
    return prisma.pharmacySettings.upsert({
      where: { id: SETTINGS_ID },
      update: input,
      create: { id: SETTINGS_ID, ...input },
    });
  },
};
