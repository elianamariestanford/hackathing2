"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

export default function BusyChart({
  weekly,
}: {
  weekly: { weekStartISO: string; Academic: number; Social: number; Other: number }[];
}) {
  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <BarChart data={weekly}>
          <XAxis dataKey="weekStartISO" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Academic" />
          <Bar dataKey="Social" />
          <Bar dataKey="Other" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
