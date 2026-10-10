"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { CategoryDistributionEntry } from "@/types/dashboard";

export function CategoryPieChart({ data }: { data: CategoryDistributionEntry[] }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base font-semibold">Medicine Categories Distribution</CardTitle></CardHeader>
      <CardContent className="h-[280px]">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No medicines yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" outerRadius={90} label={({ name, value }) => `${name} ${value}%`}>
                {data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
