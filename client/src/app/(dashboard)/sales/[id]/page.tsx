"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { salesApi } from "@/lib/api/sales";
import { Sale } from "@/types/sale";
import { formatCurrency } from "@/lib/utils/currency";
import { groupSaleItemsForDisplay } from "@/lib/utils/sale-items";

export default function SaleInvoicePage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sale, setSale] = useState<Sale | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    salesApi.get(params.id).then(setSale).catch((err) =>
      setError(err instanceof Error ? err.message : "Could not load invoice.")
    );
  }, [params.id]);

  useEffect(() => {
    if (sale && searchParams.get("print") === "1") {
      const timer = setTimeout(() => window.print(), 300);
      return () => clearTimeout(timer);
    }
  }, [sale, searchParams]);

  if (error) return <p className="text-sm text-red-500">{error}</p>;
  if (!sale) return <p className="text-sm text-muted-foreground">Loading invoice...</p>;

  const lines = groupSaleItemsForDisplay(sale.items);
  const discountAmount = sale.subtotalAmount - sale.totalAmount;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <Button variant="outline" onClick={() => router.push("/sales")}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to invoices
        </Button>
        <Button onClick={() => window.print()}>
          <Printer className="mr-1.5 h-4 w-4" /> Print
        </Button>
      </div>

      <div className="mx-auto w-[302px] rounded-lg border bg-white p-4 font-mono text-xs shadow-sm print:w-[80mm] print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <div className="text-center">
          <p className="text-sm font-bold">HPK PHARMACY &amp; LABORATORY</p>
          <p>Invoice #{sale.invoiceNumber}</p>
          <p>{new Date(sale.soldAt).toLocaleString()}</p>
          <p>Cashier: {sale.user?.name || sale.user?.email}</p>
        </div>

        <div className="my-2 border-t border-dashed border-gray-400" />

        <div className="space-y-1.5">
          {lines.map((line) => (
            <div key={line.key}>
              <div className="flex justify-between">
                <span>{line.name}</span>
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>
                  {line.brand} — {line.quantity} x {line.price.toFixed(2)}
                </span>
                <span className="text-xs font-medium text-foreground">
                  {(line.price * line.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="my-2 border-t border-dashed border-gray-400" />

        <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(sale.subtotalAmount)}</span></div>
        {sale.discountPercent > 0 && (
          <div className="flex justify-between">
            <span>Discount ({sale.discountPercent}%)</span><span>-{formatCurrency(discountAmount)}</span>
          </div>
        )}
        <div className="mt-1 flex justify-between border-t pt-1 text-sm font-bold">
          <span>TOTAL</span><span>{formatCurrency(sale.totalAmount)}</span>
        </div>
        <p className="mt-1">Payment: {sale.paymentMethod}</p>

        <div className="my-2 border-t border-dashed border-gray-400" />
        <p className="text-center">Thank you! Get well soon.</p>
      </div>
    </div>
  );
}
