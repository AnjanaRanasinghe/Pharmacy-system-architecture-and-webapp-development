"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { day: "Mon", usage: 40 }, { day: "Tue", usage: 32 }, { day: "Wed", usage: 55 },
  { day: "Thu", usage: 47 }, { day: "Fri", usage: 62 }, { day: "Sat", usage: 38 }, { day: "Sun", usage: 30 },
];

export function WeeklyStockChart() {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base font-semibold">Weekly Stock Usage</CardTitle></CardHeader>
      <CardContent className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} />
            <Tooltip />
            <Bar dataKey="usage" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}