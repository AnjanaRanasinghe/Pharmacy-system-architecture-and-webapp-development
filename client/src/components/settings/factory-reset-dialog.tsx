"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { backupApi } from "@/lib/api/backup";

const CONFIRM_PHRASE = "RESET";

interface FactoryResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FactoryResetDialog({ open, onOpenChange }: FactoryResetDialogProps) {
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open) {
      setPassword("");
      setConfirmText("");
      setError(null);
      setDone(false);
      setSubmitting(false);
    }
  }, [open]);

  const canSubmit = confirmText === CONFIRM_PHRASE && password.length > 0 && !submitting;

  async function handleReset() {
    setError(null);
    setSubmitting(true);
    try {
      await backupApi.factoryReset(password);
      setDone(true);
      setTimeout(() => {
        window.location.href = "/signup";
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Factory reset failed.");
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !submitting && onOpenChange(next)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" /> Factory reset
          </DialogTitle>
          <DialogDescription>
            This permanently deletes every medicine, sale, purchase, return, category, supplier, user account, and
            setting — not just data you can see, everything. Invoice numbering restarts from 1. You will be signed
            out and sent to create a brand-new admin account. This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
            Reset complete. Redirecting you to create a new account...
          </p>
        ) : (
          <div className="space-y-4">
            <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              Make sure you have a recent backup downloaded somewhere safe before doing this — once confirmed,
              there is no way back inside the app.
            </p>

            <div className="space-y-1.5">
              <Label htmlFor="resetPassword">Confirm your password</Label>
              <Input
                id="resetPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="resetConfirmPhrase">
                Type <span className="font-mono font-semibold">{CONFIRM_PHRASE}</span> to confirm
              </Label>
              <Input
                id="resetConfirmPhrase"
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
            <Button variant="destructive" onClick={handleReset} disabled={!canSubmit}>
              {submitting ? "Resetting..." : "Reset everything"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
