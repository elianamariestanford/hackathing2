"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { format } from "date-fns";

export default function BusyChart({
  weekly,
}: {
  weekly: { weekStartISO: string; Academic: number; Social: number; Other: number }[];
}) {
  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <BarChart
          data={weekly}
          barGap={6}
          barCategoryGap="20%"
        >
          <XAxis
            dataKey="weekStartISO"
            tickFormatter={(iso) => format(new Date(iso), "MMM d")}
          />
          <YAxis />
          <Tooltip
            labelFormatter={(iso) => format(new Date(iso), "MMM d")}
          />
          <Legend />

          <Bar dataKey="Academic" fill="#4f46e5" radius={[6, 6, 0, 0]} />
          <Bar dataKey="Social" fill="#22c55e" radius={[6, 6, 0, 0]} />
          <Bar dataKey="Other" fill="#f97316" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
