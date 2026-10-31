"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Upload } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BackupMeta } from "@/types/backup";
import { backupApi } from "@/lib/api/backup";
import { formatBackupDate, formatBytes } from "@/lib/utils/format-backup";

const CONFIRM_PHRASE = "RESTORE";

interface RestoreBackupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  backups: BackupMeta[];
}

export function RestoreBackupDialog({ open, onOpenChange, backups }: RestoreBackupDialogProps) {
  const [selectedFilename, setSelectedFilename] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setSelectedFilename(null);
      setUploadFile(null);
      setConfirmText("");
      setError(null);
      setDone(false);
      setSubmitting(false);
    }
  }, [open]);

  const canSubmit = confirmText === CONFIRM_PHRASE && (selectedFilename !== null || uploadFile !== null) && !submitting;

  async function handleRestore() {
    setError(null);
    setSubmitting(true);
    try {
      if (uploadFile) {
        await backupApi.restoreUpload(uploadFile);
      } else if (selectedFilename) {
        await backupApi.restoreExisting(selectedFilename);
      }
      setDone(true);
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Restore failed.");
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !submitting && onOpenChange(next)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" /> Restore data
          </DialogTitle>
          <DialogDescription>
            This replaces every medicine, sale, purchase, and setting currently in the system with whatever is in
            the backup you pick. Everything entered since that backup was made will be permanently lost. This
            cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
            Restore complete. Reloading the app...
          </p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Pick a saved backup</Label>
              <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border p-1.5">
                {backups.length === 0 ? (
                  <p className="p-2 text-sm text-muted-foreground">No saved backups yet.</p>
                ) : (
                  backups.map((b) => (
                    <button
                      key={b.filename}
                      type="button"
                      onClick={() => {
                        setSelectedFilename(b.filename);
                        setUploadFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                        selectedFilename === b.filename ? "bg-primary/10 text-primary" : "hover:bg-muted"
                      }`}
                    >
                      <span>{formatBackupDate(b.createdAt)}</span>
                      <span className="text-xs text-muted-foreground">{formatBytes(b.sizeBytes)}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              or
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="restoreFile">Upload a backup file (.json.gz)</Label>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5" /> Choose file
                </Button>
                <span className="truncate text-sm text-muted-foreground">
                  {uploadFile ? uploadFile.name : "No file chosen"}
                </span>
              </div>
              <input
                ref={fileInputRef}
                id="restoreFile"
                type="file"
                accept=".gz,.json,application/gzip,application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setUploadFile(file);
                  if (file) setSelectedFilename(null);
                }}
              />
            </div>

            <div className="space-y-1.5 border-t pt-3">
              <Label htmlFor="confirmPhrase">
                Type <span className="font-mono font-semibold">{CONFIRM_PHRASE}</span> to confirm
              </Label>
              <Input
                id="confirmPhrase"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={CONFIRM_PHRASE}
                autoComplete="off"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )}

        {!done && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRestore} disabled={!canSubmit}>
              {submitting ? "Restoring..." : "Restore"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
