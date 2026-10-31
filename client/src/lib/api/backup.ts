import { api } from "./client";
import { BackupMeta, RestoreResult } from "@/types/backup";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function parseErrorResponse(res: Response): Promise<string> {
  const body = await res.json().catch(() => null);
  const error = body?.error;
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const messages = [...(error.formErrors ?? []), ...Object.values(error.fieldErrors ?? {}).flat()];
    if (messages.length > 0) return messages.join(" ");
  }
  return `Request failed with status ${res.status}`;
}

export const backupApi = {
  list: () => api.get<BackupMeta[]>("/backup"),

  create: () => api.post<BackupMeta>("/backup", {}),

  remove: (filename: string) => api.delete<void>(`/backup/${encodeURIComponent(filename)}`),

  restoreExisting: (filename: string) =>
    api.post<RestoreResult>(`/backup/restore/${encodeURIComponent(filename)}`, {}),

  factoryReset: (password: string) => api.post<void>("/backup/factory-reset", { password }),

  // Downloads a backup file straight to the browser's downloads folder.
  async download(filename: string): Promise<void> {
    const res = await fetch(`${API_URL}/backup/${encodeURIComponent(filename)}/download`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error(await parseErrorResponse(res));
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  // Multipart upload — can't go through the JSON-only `api` client.
  async restoreUpload(file: File): Promise<RestoreResult> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_URL}/backup/restore/upload`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!res.ok) throw new Error(await parseErrorResponse(res));
    return res.json();
  },
};
