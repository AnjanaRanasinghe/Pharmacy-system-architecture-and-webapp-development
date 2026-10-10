"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { SalesVsPurchasesPoint } from "@/types/dashboard";

export function SalesTrendChart({ data }: { data: SalesVsPurchasesPoint[] }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base font-semibold">Sales vs Purchases Trend</CardTitle></CardHeader>
      <CardContent className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="purchases" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
