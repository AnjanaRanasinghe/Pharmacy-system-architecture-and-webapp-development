"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sale } from "@/types/sale";
import { formatCurrency } from "@/lib/utils/currency";
import { useFieldChainNav } from "@/hooks/use-field-chain-nav";

interface ReturnableLine {
  saleItemId: string;
  name: string;
  brand: string;
  batchNumber: string;
  originalQuantity: number;
  alreadyReturned: number;
  returnable: number;
  netUnitPrice: number;
}

export interface ReturnSubmitPayload {
  reason?: string;
  items: { saleItemId: string; quantity: number; restock: boolean }[];
}

interface ReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale | null;
  onSubmit: (payload: ReturnSubmitPayload) => Promise<void>;
}

function computeReturnableLines(sale: Sale): ReturnableLine[] {
  const returnedBySaleItem = new Map<string, number>();
  for (const ret of sale.returns) {
    for (const ri of ret.items) {
      returnedBySaleItem.set(ri.saleItemId, (returnedBySaleItem.get(ri.saleItemId) ?? 0) + ri.quantity);
    }
  }

  return sale.items
    .map((item) => {
      const alreadyReturned = returnedBySaleItem.get(item.id) ?? 0;
      return {
        saleItemId: item.id,
        name: item.batch?.product.name ?? "Unknown item",
        brand: item.batch?.product.brand ?? "",
        batchNumber: item.batch?.batchNumber ?? "",
        originalQuantity: item.quantity,
        alreadyReturned,
        returnable: item.quantity - alreadyReturned,
        netUnitPrice: item.price * (1 - item.discountPercent / 100) * (1 - sale.discountPercent / 100),
      };
    })
    .filter((line) => line.returnable > 0);
}

export function ReturnDialog({ open, onOpenChange, sale, onSubmit }: ReturnDialogProps) {
  const lines = useMemo(() => (sale ? computeReturnableLines(sale) : []), [sale]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [restock, setRestock] = useState<Record<string, boolean>>({});
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // One quantity input per returnable line, then the submit button.
  const { registerRef, handleKeyDown } = useFieldChainNav(lines.length + 1);

  useEffect(() => {
    if (!open) return;
    setSelected({});
    setQuantities(Object.fromEntries(lines.map((l) => [l.saleItemId, l.returnable])));
    setRestock({});
    setReason("");
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sale?.id]);

  const refundPreview = lines
    .filter((l) => selected[l.saleItemId])
    .reduce((sum, l) => sum + (quantities[l.saleItemId] ?? 0) * l.netUnitPrice, 0);

  async function handleSubmit() {
    const items = lines
      .filter((l) => selected[l.saleItemId])
      .map((l) => ({ saleItemId: l.saleItemId, quantity: quantities[l.saleItemId] ?? 0, restock: Boolean(restock[l.saleItemId]) }));

    if (items.length === 0) {
      setError("Select at least one item to return.");
      return;
    }
    for (const item of items) {
      const line = lines.find((l) => l.saleItemId === item.saleItemId)!;
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > line.returnable) {
        setError(`Quantity for ${line.name} must be a whole number between 1 and ${line.returnable}.`);
        return;
      }
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ reason: reason.trim() || undefined, items });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not process the return.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!sale) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Return items — {sale.invoiceNumber}</DialogTitle>
          <DialogDescription>
            Select what the customer is returning. Only check &quot;Restock&quot; for items that can actually be resold.
          </DialogDescription>
        </DialogHeader>

        {lines.length === 0 ? (
          <p className="text-sm text-muted-foreground">Every item on this invoice has already been fully returned.</p>
        ) : (
          <div className="space-y-3">
            <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {lines.map((line, index) => (
                <div key={line.saleItemId} className="flex items-center gap-3 rounded-lg border p-3">
                  <input
                    type="checkbox"
                    aria-label={`Return ${line.name}`}
                    className="h-4 w-4 shrink-0"
                    checked={Boolean(selected[line.saleItemId])}
                    onChange={(e) => setSelected((prev) => ({ ...prev, [line.saleItemId]: e.target.checked }))}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {line.name} <span className="font-normal text-muted-foreground">({line.brand})</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Batch {line.batchNumber || "—"} · {line.returnable} of {line.originalQuantity} returnable
                      {line.alreadyReturned > 0 && ` · ${line.alreadyReturned} already returned`}
                    </p>
                  </div>
                  <div className="w-20 space-y-1">
                    <Label className="text-xs">Qty</Label>
                    <Input
                      ref={registerRef(index)}
                      type="number"
                      min={1}
                      max={line.returnable}
                      value={quantities[line.saleItemId] ?? line.returnable}
                      disabled={!selected[line.saleItemId]}
                      onChange={(e) => setQuantities((prev) => ({ ...prev, [line.saleItemId]: Number(e.target.value) }))}
                      onKeyDown={handleKeyDown(index)}
                    />
                  </div>
                  <label className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={Boolean(restock[line.saleItemId])}
                      disabled={!selected[line.saleItemId]}
                      onChange={(e) => setRestock((prev) => ({ ...prev, [line.saleItemId]: e.target.checked }))}
                    />
                    Restock
                  </label>
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="returnReason">Reason (optional)</Label>
              <Textarea
                id="returnReason"
                placeholder="e.g. wrong item dispensed, customer changed mind..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="rounded-lg bg-blue-50/60 px-3 py-2 text-sm">
              Refund amount: <span className="font-semibold">{formatCurrency(refundPreview)}</span>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          {lines.length > 0 && (
            <Button
              ref={registerRef(lines.length)}
              onClick={handleSubmit}
              onKeyDown={handleKeyDown(lines.length)}
              disabled={submitting}
            >
              {submitting ? "Processing..." : "Process return"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
