import { api } from "./client";
import { Category } from "@/types/category";

type CategoryInput = Pick<Category, "name" | "description">;
// Prisma's create/update return the raw row — no medicineCount (that's a computed join, only on list())
type CategoryDto = Omit<Category, "medicineCount">;

export const categoriesApi = {
  list: () => api.get<Category[]>("/categories"),
  create: (data: CategoryInput) => api.post<CategoryDto>("/categories", data),
  update: (id: string, data: CategoryInput) => api.put<CategoryDto>(`/categories/${id}`, data),
  remove: (id: string) => api.delete<void>(`/categories/${id}`),
};