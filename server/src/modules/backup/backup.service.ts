import fs from "fs";
import path from "path";
import zlib from "zlib";
import { prisma } from "../../config/db";
import { AppError } from "../../common/errors/app-error";

// Every table in the database, in an order safe to INSERT (parents before children).
// Restoring deletes in the exact reverse of this order (children before parents) so
// foreign keys never point at a row that doesn't exist yet.
const TABLES_PARENT_FIRST = [
  "pharmacySettings",
  "users",
  "customers",
  "categories",
  "suppliers",
  "products",
  "purchases",
  "purchaseItems",
  "stockBatches",
  "sales",
  "saleItems",
  "saleReturns",
  "saleReturnItems",
  "notifications",
] as const;

type TableName = (typeof TABLES_PARENT_FIRST)[number];

// Maps our backup's table names to the Prisma model delegate that reads/writes them.
const MODEL_FOR_TABLE: Record<TableName, keyof typeof prisma> = {
  pharmacySettings: "pharmacySettings",
  users: "user",
  customers: "customer",
  categories: "category",
  suppliers: "supplier",
  products: "product",
  purchases: "purchase",
  purchaseItems: "purchaseItem",
  stockBatches: "stockBatch",
  sales: "sale",
  saleItems: "saleItem",
  saleReturns: "saleReturn",
  saleReturnItems: "saleReturnItem",
  notifications: "notification",
};

// Tables with an autoincrement sequenceNumber column — after a bulk restore the
// underlying Postgres sequence still thinks it's at 0, so the very next sale/purchase
// would collide with a restored row. Bump each sequence past the restored max.
const SEQUENCE_TABLES: { table: string; column: string }[] = [
  { table: "purchases", column: "sequence_number" },
  { table: "sales", column: "sequence_number" },
  { table: "sale_returns", column: "sequence_number" },
];

const BACKUP_VERSION = 1;
const BACKUP_DIR = path.join(process.cwd(), "backups");
const MAX_BACKUPS_TO_KEEP = 14;
const FILENAME_PATTERN = /^backup-\d{8}-\d{6}\.json\.gz$/;

function ensureBackupDir() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function timestampForFilename(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-` +
    `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  );
}

export interface BackupMeta {
  filename: string;
  sizeBytes: number;
  createdAt: string;
}

export interface RestoreResult {
  restoredAt: string;
  tableCounts: Record<string, number>;
}

async function exportAllTables(): Promise<Record<TableName, unknown[]>> {
  const result = {} as Record<TableName, unknown[]>;
  for (const table of TABLES_PARENT_FIRST) {
    const model = prisma[MODEL_FOR_TABLE[table]] as { findMany: () => Promise<unknown[]> };
    result[table] = await model.findMany();
  }
  return result;
}

function listBackupFilesSortedDesc(): string[] {
  ensureBackupDir();
  return fs
    .readdirSync(BACKUP_DIR)
    .filter((name) => FILENAME_PATTERN.test(name))
    .sort((a, b) => (a < b ? 1 : -1)); // filenames are timestamp-ordered, so string sort works
}

function rotateOldBackups() {
  const files = listBackupFilesSortedDesc();
  for (const stale of files.slice(MAX_BACKUPS_TO_KEEP)) {
    fs.unlinkSync(path.join(BACKUP_DIR, stale));
  }
}

function resolveBackupPath(filename: string): string {
  if (!FILENAME_PATTERN.test(filename)) {
    throw new AppError("Invalid backup filename.");
  }
  const resolved = path.join(BACKUP_DIR, filename);
  if (path.dirname(resolved) !== BACKUP_DIR) {
    throw new AppError("Invalid backup filename.");
  }
  if (!fs.existsSync(resolved)) {
    throw new AppError("Backup file not found.", 404);
  }
  return resolved;
}

async function performRestore(raw: Buffer): Promise<RestoreResult> {
  const isGzip = raw.length > 2 && raw[0] === 0x1f && raw[1] === 0x8b;
  const jsonText = (isGzip ? zlib.gunzipSync(raw) : raw).toString("utf-8");

  let parsed: { version?: number; tables?: Record<string, unknown[]> };
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new AppError("That file isn't a valid backup (couldn't parse it as JSON).");
  }

  if (parsed.version !== BACKUP_VERSION || !parsed.tables || typeof parsed.tables !== "object") {
    throw new AppError("That file isn't a recognized backup, or it's from an incompatible app version.");
  }

  for (const table of TABLES_PARENT_FIRST) {
    if (!Array.isArray(parsed.tables[table])) {
      throw new AppError(`Backup file is missing or corrupt data for "${table}".`);
    }
  }

  const tables = parsed.tables as Record<TableName, unknown[]>;
  const tableCounts: Record<string, number> = {};

  await prisma.$transaction(
    async (tx) => {
      const txAny = tx as any;

      // Delete children before parents.
      for (const table of [...TABLES_PARENT_FIRST].reverse()) {
        await txAny[MODEL_FOR_TABLE[table]].deleteMany();
      }

      // Insert parents before children.
      for (const table of TABLES_PARENT_FIRST) {
        const rows = tables[table];
        tableCounts[table] = rows.length;
        if (rows.length === 0) continue;
        await txAny[MODEL_FOR_TABLE[table]].createMany({ data: rows });
      }

      // Re-sync autoincrement sequences past the restored data's highest value.
      for (const { table, column } of SEQUENCE_TABLES) {
        await tx.$executeRawUnsafe(
          `SELECT setval(pg_get_serial_sequence('${table}', '${column}'), COALESCE((SELECT MAX(${column}) FROM ${table}), 0) + 1, false);`
        );
      }
    },
    { timeout: 120_000, maxWait: 10_000 }
  );

  return { restoredAt: new Date().toISOString(), tableCounts };
}

export const backupService = {
  async createBackup(): Promise<BackupMeta> {
    ensureBackupDir();
    const now = new Date();
    const tables = await exportAllTables();
    const payload = JSON.stringify({ version: BACKUP_VERSION, exportedAt: now.toISOString(), tables });
    const gzipped = zlib.gzipSync(payload);

    const filename = `backup-${timestampForFilename(now)}.json.gz`;
    fs.writeFileSync(path.join(BACKUP_DIR, filename), gzipped);
    rotateOldBackups();

    return { filename, sizeBytes: gzipped.length, createdAt: now.toISOString() };
  },

  listBackups(): BackupMeta[] {
    return listBackupFilesSortedDesc().map((filename) => {
      const stat = fs.statSync(path.join(BACKUP_DIR, filename));
      return { filename, sizeBytes: stat.size, createdAt: stat.mtime.toISOString() };
    });
  },

  getBackupFileForDownload(filename: string): { path: string; filename: string } {
    return { path: resolveBackupPath(filename), filename };
  },

  deleteBackup(filename: string): void {
    fs.unlinkSync(resolveBackupPath(filename));
  },

  restoreFromUpload(buffer: Buffer): Promise<RestoreResult> {
    return performRestore(buffer);
  },

  restoreFromExisting(filename: string): Promise<RestoreResult> {
    const filePath = resolveBackupPath(filename);
    return performRestore(fs.readFileSync(filePath));
  },

  hasAnyBackup(): boolean {
    return listBackupFilesSortedDesc().length > 0;
  },
};
