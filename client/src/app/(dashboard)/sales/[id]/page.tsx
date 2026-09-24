"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { salesApi } from "@/lib/api/sales";
import { Sale } from "@/types/sale";
import { formatCurrency } from "@/lib/utils/currency";
import { groupSaleItemsForDisplay } from "@/lib/utils/sale-items";
import { displayNameFromEmail } from "@/lib/utils/user";

const PHARMACY_ADDRESS = "No: 119/A/C1, Yagodamulla, Kotugoda";
const PHARMACY_WHATSAPP = "0786700023";

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
  const soldAt = new Date(sale.soldAt);
  const cashierName = sale.user?.name || (sale.user?.email ? displayNameFromEmail(sale.user.email) : "");
  const cashBalance = sale.cashTendered != null ? sale.cashTendered - sale.totalAmount : null;

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
          <p>{PHARMACY_ADDRESS}</p>
          <p>WhatsApp {PHARMACY_WHATSAPP}</p>
        </div>

        <p className="mt-2 text-center font-bold">INVOICE</p>

        <div className="my-2 border-t border-dashed border-gray-400" />

        <div className="flex justify-between">
          <span>Date : {soldAt.toLocaleDateString()}</span>
          <span>Invoice# : {sale.invoiceNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Time : {soldAt.toLocaleTimeString()}</span>
          <span>User : {cashierName}</span>
        </div>
        <p>Customer :</p>

        <div className="my-2 border-t border-dashed border-gray-400" />

        <div className="space-y-1.5">
          {lines.map((line, index) => (
            <div key={line.key}>
              <div>{index + 1}. {line.name}{line.brand ? ` (${line.brand})` : ""}</div>
              <div className="flex justify-between text-muted-foreground">
                <span>{line.quantity} x {line.price.toFixed(2)}</span>
                <span className="font-medium text-foreground">{(line.price * line.quantity).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="my-2 border-t border-dashed border-gray-400" />

        <div className="flex justify-between"><span>GROSS TOTAL</span><span>{formatCurrency(sale.subtotalAmount)}</span></div>
        {sale.discountPercent > 0 && (
          <div className="flex justify-between"><span>DISCOUNT ({sale.discountPercent}%)</span><span>{formatCurrency(discountAmount)}</span></div>
        )}
        <div className="flex justify-between text-sm font-bold"><span>NET TOTAL</span><span>{formatCurrency(sale.totalAmount)}</span></div>
        {sale.cashTendered != null && (
          <div className="flex justify-between"><span>CASH TEND</span><span>{formatCurrency(sale.cashTendered)}</span></div>
        )}
        {cashBalance != null && (
          <div className="flex justify-between text-sm font-bold"><span>CASH BALANCE</span><span>{formatCurrency(cashBalance)}</span></div>
        )}

        <div className="my-2 border-t border-dashed border-gray-400" />

        <p className="text-center">[{lines.length} items]</p>
        <p className="mt-1 text-center">Thank you! Get well soon.</p>
        <p className="text-center">Software By ASR Solutions (0714875821)</p>
      </div>
    </div>
  );
}
