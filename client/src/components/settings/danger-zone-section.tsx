"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FactoryResetDialog } from "./factory-reset-dialog";

export function DangerZoneSection() {
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-3xl rounded-xl border border-destructive/30 bg-destructive/5 p-5">
      <div className="mb-1 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <h2 className="text-sm font-semibold text-destructive">Danger Zone</h2>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        Permanently erase all data and start the system over from a clean slate, with invoice numbering back at 1.
        Only use this once, when setting the shop up for real for the first time.
      </p>

      <div className="flex items-center justify-between rounded-lg border bg-white p-4">
        <div>
          <p className="text-sm font-medium">Factory reset</p>
          <p className="text-xs text-muted-foreground">Delete everything and start from scratch</p>
        </div>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          Factory Reset
        </Button>
      </div>

      <FactoryResetDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
