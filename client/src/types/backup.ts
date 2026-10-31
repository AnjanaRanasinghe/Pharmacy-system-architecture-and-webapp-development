export interface BackupMeta {
  filename: string;
  sizeBytes: number;
  createdAt: string;
}

export interface RestoreResult {
  restoredAt: string;
  tableCounts: Record<string, number>;
}
