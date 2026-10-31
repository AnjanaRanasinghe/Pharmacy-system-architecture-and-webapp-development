import { backupService } from "./backup.service";

const BACKUP_HOUR = 2; // 2:00 AM local server time — the shop is closed, so a brief lock is harmless.

function msUntilNextRun(): number {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), BACKUP_HOUR, 0, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

async function runAndReschedule() {
  try {
    await backupService.createBackup();
    console.log("[backup] Nightly backup created.");
  } catch (err) {
    console.error("[backup] Nightly backup failed:", err);
  }
  setTimeout(runAndReschedule, msUntilNextRun());
}

// Starts the nightly auto-backup loop. Also takes an immediate backup on a brand-new
// install (no backups exist yet) so the shop isn't unprotected until the first 2 AM.
export function startBackupScheduler() {
  if (!backupService.hasAnyBackup()) {
    backupService
      .createBackup()
      .then(() => console.log("[backup] Initial backup created."))
      .catch((err) => console.error("[backup] Initial backup failed:", err));
  }
  setTimeout(runAndReschedule, msUntilNextRun());
}
