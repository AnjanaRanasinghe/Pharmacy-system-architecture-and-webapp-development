export type MedicineStatus = "in-stock" | "low-stock";

export interface Medicine {
  id: string;
  name: string;
  brand: string;
  category: string;
  supplier: string;
  batchNumber: string;
  quantity: number;
  price: number;
  expiryDate: string; // "YYYY-MM-DD"
  description?: string;
}

export function getMedicineStatus(quantity: number): MedicineStatus {
  return quantity <= 20 ? "low-stock" : "in-stock";
}