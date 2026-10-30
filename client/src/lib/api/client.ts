const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Server errors arrive either as a plain string (AppError / service-thrown errors) or,
// for zod validation failures, as `.flatten()`'s {formErrors, fieldErrors} shape —
// extract a readable sentence either way instead of ever showing raw JSON.
function describeError(error: unknown): string | null {
  if (!error) return null;
  if (typeof error === "string") return error;
  if (typeof error === "object") {
    const { formErrors, fieldErrors } = error as { formErrors?: string[]; fieldErrors?: Record<string, string[]> };
    const messages = [
      ...(formErrors ?? []),
      ...Object.values(fieldErrors ?? {}).flat(),
    ].filter(Boolean);
    if (messages.length > 0) return messages.join(" ");
  }
  return null;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
  credentials: "include",
  headers: { "Content-Type": "application/json", ...options?.headers },
  ...options,
});

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(describeError(errorBody?.error) ?? `Request failed with status ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};