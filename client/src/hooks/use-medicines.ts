"use client";

import { useState } from "react";
import { Medicine } from "@/types/medicine";

const initialMedicines: Medicine[] = [
  { id: "1", name: "Paracetamol", brand: "Tylenol", category: "Pain Relief", supplier: "MedSupply Co.", batchNumber: "BATCH001", quantity: 150, price: 5.99, expiryDate: "2025-12-31" },
  { id: "2", name: "Amoxicillin", brand: "Amoxil", category: "Antibiotics", supplier: "PharmaDirect", batchNumber: "BATCH002", quantity: 12, price: 15.99, expiryDate: "2025-03-15" },
  { id: "3", name: "Ibuprofen", brand: "Advil", category: "Pain Relief", supplier: "MedSupply Co.", batchNumber: "BATCH003", quantity: 200, price: 8.99, expiryDate: "2026-06-20" },
  { id: "4", name: "Cetirizine", brand: "Zyrtec", category: "Antihistamine", supplier: "PharmaDirect", batchNumber: "BATCH004", quantity: 8, price: 12.99, expiryDate: "2025-01-10" },
  { id: "5", name: "Vitamin D3", brand: "Nature Made", category: "Vitamins", supplier: "Wellness Distributors", batchNumber: "BATCH005", quantity: 300, price: 18.99, expiryDate: "2026-08-30" },
];

type MedicineInput = Omit<Medicine, "id" | "batchNumber">;

export function useMedicines() {
  const [medicines, setMedicines] = useState<Medicine[]>(initialMedicines);

  function addMedicine(data: MedicineInput) {
    // TODO: replace with `await api.post("/medicines", data)` once the backend is ready
    const newMedicine: Medicine = {
      ...data,
      id: crypto.randomUUID(),
      batchNumber: `BATCH${String(medicines.length + 1).padStart(3, "0")}`,
    };
    setMedicines((prev) => [newMedicine, ...prev]);
  }

  function updateMedicine(id: string, data: MedicineInput) {
    // TODO: replace with `await api.put(`/medicines/${id}`, data)`
    setMedicines((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
  }

  function deleteMedicine(id: string) {
    // TODO: replace with `await api.delete(`/medicines/${id}`)`
    setMedicines((prev) => prev.filter((m) => m.id !== id));
  }

  return { medicines, addMedicine, updateMedicine, deleteMedicine };
}