import { Prisma } from "@prisma/client";

// Prisma's Decimal fields serialize to JSON as strings (Decimal.prototype.toJSON
// returns a string), so any money/percentage field silently arrives at the client
// as a string unless converted here first. Apply this to anything returned from
// Prisma before res.json(...).
export function serializeDecimals<T>(value: T): T {
  if (value instanceof Prisma.Decimal) {
    return value.toNumber() as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((v) => serializeDecimals(v)) as unknown as T;
  }
  if (value instanceof Date) {
    return value;
  }
  if (value !== null && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = serializeDecimals(val);
    }
    return result as T;
  }
  return value;
}
