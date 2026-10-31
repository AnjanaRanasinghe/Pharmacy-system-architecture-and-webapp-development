"use client";

import { useState } from "react";
import { Download, Trash2, Database } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { BackupMeta } from "@/types/backup";
import { backupApi } from "@/lib/api/backup";
import { formatBackupDate, formatBytes } from "@/lib/utils/format-backup";

interface ViewBackupsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  backups: BackupMeta[];
  onChanged: () => void;
}

export function ViewBackupsDialog({ open, onOpenChange, backups, onChanged }: ViewBackupsDialogProps) {
  const [busyFile, setBusyFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<BackupMeta | null>(null);

  async function handleDownload(filename: string) {
    setError(null);
    setBusyFile(filename);
    try {
      await backupApi.download(filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't download that backup.");
    } finally {
      setBusyFile(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deleting) return;
    setError(null);
    setBusyFile(deleting.filename);
    try {
      await backupApi.remove(deleting.filename);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete that backup.");
    } finally {
      setBusyFile(null);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>All backups</DialogTitle>
            <DialogDescription>
              Stored on this computer in the server&apos;s <code>backups</code> folder. Download a copy to a USB
              drive or cloud storage regularly — a backup that only lives on this machine won&apos;t help if this
              machine fails.
            </DialogDescription>
          </DialogHeader>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="max-h-80 space-y-2 overflow-y-auto">
            {backups.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No backups yet.</p>
            ) : (
              backups.map((b) => (
                <div key={b.filename} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Database className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{formatBackupDate(b.createdAt)}</p>
                      <p className="text-xs text-muted-foreground">{formatBytes(b.sizeBytes)}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Download backup"
                      disabled={busyFile === b.filename}
                      onClick={() => handleDownload(b.filename)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete backup"
                      disabled={busyFile === b.filename}
                      onClick={() => setDeleting(b)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this backup?"
        description={deleting ? `Delete the backup from ${formatBackupDate(deleting.createdAt)}? This can't be undone.` : ""}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
