"use client";

import { useState } from "react";
import { AggregateStats } from "@/lib/marketApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MarketChartsProps {
  distanceStats: AggregateStats[];
  yearStats: AggregateStats[];
}

export default function MarketCharts({ distanceStats, yearStats }: MarketChartsProps) {
  const [activeMetric, setActiveMetric] = useState<"distance" | "year">("distance");

  const currentData = activeMetric === "distance" ? distanceStats : yearStats;

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Market Price Distributions</h2>
          <p className="text-xs text-slate-500">
            Computed in real-time by Java Spring Boot backend using in-memory LRU cache
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-md text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveMetric("distance")}
            className={`px-3 py-1.5 rounded transition ${
              activeMetric === "distance"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            By Distance to Downtown
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric("year")}
            className={`px-3 py-1.5 rounded transition ${
              activeMetric === "year"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            By Construction Era
          </button>
        </div>
      </div>

      {currentData.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-sm">
          No historical data available. Create valuations to populate aggregates.
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={currentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="bucket" tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(val: number) => [`$${val.toLocaleString()}`, "Average Price"]}
                contentStyle={{ borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
              <Bar dataKey="averagePrice" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Average Price" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}