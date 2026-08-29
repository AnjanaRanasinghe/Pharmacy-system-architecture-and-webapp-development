"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Antibiotics", value: 29, color: "#3b82f6" },
  { name: "Pain Relief", value: 22, color: "#22c55e" },
  { name: "Cardiac", value: 20, color: "#ef4444" },
  { name: "Vitamins", value: 15, color: "#f59e0b" },
  { name: "Others", value: 14, color: "#8b5cf6" },
];

export function CategoryPieChart() {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base font-semibold">Medicine Categories Distribution</CardTitle></CardHeader>
      <CardContent className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={90} label={({ name, value }) => `${name} ${value}%`}>
              {data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}