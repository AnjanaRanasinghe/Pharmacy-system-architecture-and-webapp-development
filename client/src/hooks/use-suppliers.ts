"use client";

import { useState } from "react";
import { Supplier } from "@/types/supplier";

const initialSuppliers: Supplier[] = [
  { id: "1", name: "MedSupply Co.", contactPerson: "John Smith", phone: "+1 234-567-8900", email: "contact@medsupply.com", address: "123 Medical Street, NY 10001", paymentTerms: "Net 30", totalPurchases: 45000 },
  { id: "2", name: "PharmaCorp", contactPerson: "Sarah Johnson", phone: "+1 234-567-8901", email: "info@pharmacorp.com", address: "456 Pharma Avenue, CA 90210", paymentTerms: "Net 45", totalPurchases: 62000 },
  { id: "3", name: "HealthPlus", contactPerson: "Michael Brown", phone: "+1 234-567-8902", email: "sales@healthplus.com", address: "789 Health Road, TX 75001", paymentTerms: "Net 30", totalPurchases: 38000 },
  { id: "4", name: "VitaHealth", contactPerson: "Emily Davis", phone: "+1 234-567-8903", email: "contact@vitahealth.com", address: "321 Wellness Lane, FL 33101", paymentTerms: "Net 60", totalPurchases: 51000 },
];

type SupplierInput = Omit<Supplier, "id" | "totalPurchases">;

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);

  function addSupplier(data: SupplierInput) {
    // TODO: replace with `await api.post("/suppliers", data)` once the backend is ready
    setSuppliers((prev) => [...prev, { ...data, id: crypto.randomUUID(), totalPurchases: 0 }]);
  }

  function updateSupplier(id: string, data: SupplierInput) {
    // TODO: replace with `await api.put(`/suppliers/${id}`, data)`
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  }

  function deleteSupplier(id: string) {
    // TODO: replace with `await api.delete(`/suppliers/${id}`)`
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  }

  return { suppliers, addSupplier, updateSupplier, deleteSupplier };
}