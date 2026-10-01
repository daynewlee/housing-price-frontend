"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { PropertyRecord } from "@/lib/schemas";

export default function PriceChart({ records }: { records: PropertyRecord[] }) {
  if (!records || records.length === 0) {
    return <div className="text-xs text-slate-400 text-center py-10">No estimate data available for plotting.</div>;
  }

  // Display top 8 recent estimates in chronological order for chart clarity
  const data = [...records].reverse().slice(-8).map((r) => ({
    name: r.property_name.length > 12 ? `${r.property_name.slice(0, 12)}...` : r.property_name,
    price: r.predicted_price,
  }));

  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
      <h3 className="text-sm font-bold text-slate-700 mb-4">Recent Valuations Overview</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" fontSize={11} tickLine={false} />
            <YAxis fontSize={11} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(value: any) => [`$${Number(value).toLocaleString()}`, "Estimated Price"]} />
            <Bar dataKey="price" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
