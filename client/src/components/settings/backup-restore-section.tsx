"use client";

import { useEffect, useState } from "react";
import { Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackupMeta } from "@/types/backup";
import { backupApi } from "@/lib/api/backup";
import { formatBackupDate } from "@/lib/utils/format-backup";
import { ViewBackupsDialog } from "./view-backups-dialog";
import { RestoreBackupDialog } from "./restore-backup-dialog";

export function BackupRestoreSection() {
  const [backups, setBackups] = useState<BackupMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createNotice, setCreateNotice] = useState<string | null>(null);

  const [viewOpen, setViewOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);

  async function refetch() {
    setLoading(true);
    setLoadError(null);
    try {
      setBackups(await backupApi.list());
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Couldn't load backups.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refetch();
  }, []);

  async function handleCreateBackup() {
    setCreating(true);
    setCreateError(null);
    setCreateNotice(null);
    try {
      const meta = await backupApi.create();
      await refetch();
      setCreateNotice(`Backup created (${formatBackupDate(meta.createdAt)}). Downloading a copy now.`);
      await backupApi.download(meta.filename);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Couldn't create a backup.");
    } finally {
      setCreating(false);
    }
  }

  const lastBackup = backups[0] ?? null;

  return (
    <div className="max-w-3xl rounded-xl border bg-white p-5">
      <div className="mb-1 flex items-center gap-2">
        <Database className="h-4 w-4 text-blue-600" />
        <h2 className="text-sm font-semibold">Backup &amp; Restore</h2>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        A nightly backup of all your data (medicines, sales, purchases, settings) is taken automatically and kept
        for 14 days. You can also back up or restore manually at any time.
      </p>

      {loading && <p className="text-sm text-muted-foreground">Loading backups...</p>}
      {!loading && loadError && (
        <div className="space-y-2">
          <p className="text-sm text-red-500">Couldn&apos;t load backups: {loadError}</p>
          <Button variant="outline" size="sm" onClick={refetch}>Retry</Button>
        </div>
      )}

      {!loading && !loadError && (
        <>
          {createError && <p className="mb-3 text-sm text-red-500">{createError}</p>}
          {createNotice && !createError && <p className="mb-3 text-sm text-green-600">{createNotice}</p>}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Database className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium">Last Backup</p>
              <p className="text-xs text-muted-foreground">
                {lastBackup ? formatBackupDate(lastBackup.createdAt) : "No backups yet"}
              </p>
              <Button variant="outline" size="sm" className="mt-1 w-full" onClick={() => setViewOpen(true)}>
                View Backups
              </Button>
            </div>

            <div className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-50 text-green-600">
                <Database className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium">Create Backup</p>
              <p className="text-xs text-muted-foreground">Backup all system data</p>
              <Button size="sm" className="mt-1 w-full" disabled={creating} onClick={handleCreateBackup}>
                {creating ? "Creating..." : "Create Backup"}
              </Button>
            </div>

            <div className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                <Database className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium">Restore Data</p>
              <p className="text-xs text-muted-foreground">Restore from backup</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-1 w-full"
                onClick={() => setRestoreOpen(true)}
              >
                Restore
              </Button>
            </div>
          </div>
        </>
      )}

      <ViewBackupsDialog open={viewOpen} onOpenChange={setViewOpen} backups={backups} onChanged={refetch} />
      <RestoreBackupDialog open={restoreOpen} onOpenChange={setRestoreOpen} backups={backups} />
    </div>
  );
}
