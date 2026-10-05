"use client";

import { useState } from "react";
import { WhatIfResponse, WhatIfQueryParams } from "@/lib/marketApi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface WhatIfLineChartProps {
  data: WhatIfResponse | null;
  onParamChange: (params: WhatIfQueryParams) => void;
  loading: boolean;
}

// 为最多 8 根折线预设高辨识度调色板
const LINE_COLORS = [
  "#2563eb", // Blue
  "#7c3aed", // Violet
  "#059669", // Emerald
  "#d97706", // Amber
  "#dc2626", // Red
  "#0891b2", // Cyan
  "#db2777", // Pink
  "#475569", // Slate
];

export default function WhatIfLineChart({
  data,
  onParamChange,
  loading,
}: WhatIfLineChartProps) {
  const [inflationRate, setInflationRate] = useState(3.0);
  const [mortgageRate, setMortgageRate] = useState(5.5);

  const handleApply = () => {
    onParamChange({
      yearsAhead: 5,
      inflationRate,
      mortgageRate,
    });
  };

  const projections = data?.projections || [];

  // 如果后端返回了 trajectory 则直接使用；如果没有，前端根据 currentPrice 自动计算兜底
  const years = [2026, 2027, 2028, 2029, 2030, 2031];

  const chartData = years.map((year, yearIndex) => {
    const row: Record<string, string | number> = { year: `${year}` };
    projections.forEach((prop, idx) => {
      const propKey = `prop_${prop.id || idx}`;
      if (prop.trajectory && prop.trajectory[yearIndex]) {
        row[propKey] = prop.trajectory[yearIndex].price;
      } else {
        // 兜底推演
        const factor = Math.pow(1.0 + inflationRate / 100.0, yearIndex);
        row[propKey] = Math.round(prop.currentPrice * factor);
      }
    });
    return row;
  });

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
      {/* 头部控制栏 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              5-Year Valuation Trajectory (Top {projections.length} Properties)
            </h2>
            <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
              8-Property Macro Curves
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracking individual price trajectories from 2026 to 2031 based on compounded annual inflation.
          </p>
        </div>

        {/* 宏观参数输入框 */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200">
            <span className="text-slate-600 font-medium">Inflation:</span>
            <input
              type="number"
              step="0.5"
              min="0"
              max="15"
              value={inflationRate}
              onChange={(e) => setInflationRate(Number(e.target.value))}
              className="w-14 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-900 font-semibold"
            />
            <span className="text-slate-500">%</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200">
            <span className="text-slate-600 font-medium">Mortgage:</span>
            <input
              type="number"
              step="0.1"
              min="1"
              max="15"
              value={mortgageRate}
              onChange={(e) => setMortgageRate(Number(e.target.value))}
              className="w-14 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-900 font-semibold"
            />
            <span className="text-slate-500">%</span>
          </div>

          <button
            type="button"
            onClick={handleApply}
            disabled={loading}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium transition disabled:bg-indigo-300 cursor-pointer"
          >
            {loading ? "Calculating..." : "Recalculate"}
          </button>
        </div>
      </div>

      {/* 摘要指标 */}
      {data?.summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg text-xs">
          <div>
            <span className="text-slate-500 block">Baseline Avg (2026)</span>
            <span className="text-slate-800 font-bold text-sm">
              ${data.summary.avgCurrentPrice?.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Projected Avg (2031)</span>
            <span className="text-indigo-600 font-bold text-sm">
              ${data.summary.avgProjectedPrice?.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">5-Yr Total Inflation</span>
            <span className="text-emerald-600 font-bold text-sm">
              +{data.summary.overallAppreciationPct}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Compound Factor</span>
            <span className="text-slate-700 font-semibold text-sm">
              {data.macroAssumptions?.cumulativeGrowthMultiplier}x
            </span>
          </div>
        </div>
      )}

      {/* 8 根折线图 */}
      {projections.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          No cache properties found. Submit property estimates in Tab 1 first.
        </div>
      ) : (
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="year" tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  const prop = projections.find((_, idx) => `prop_${_.id || idx}` === name);
                  const label = prop ? prop.propertyName : name;
                  return [`$${value?.toLocaleString()}`, label];
                }}
                labelFormatter={(label) => `Forecast Year: ${label}`}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  fontSize: "12px",
                }}
              />
              <Legend
                verticalAlign="top"
                height={40}
                formatter={(value: string) => {
                  const prop = projections.find((_, idx) => `prop_${_.id || idx}` === value);
                  if (!prop) return value;
                  return prop.propertyName.length > 16
                    ? prop.propertyName.slice(0, 15) + "..."
                    : prop.propertyName;
                }}
                wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }}
              />

              {/* 动态渲染最多 8 根折线 */}
              {projections.map((prop, idx) => {
                const dataKey = `prop_${prop.id || idx}`;
                const color = LINE_COLORS[idx % LINE_COLORS.length];
                return (
                  <Line
                    key={dataKey}
                    type="monotone"
                    dataKey={dataKey}
                    name={dataKey}
                    stroke={color}
                    strokeWidth={2}
                    dot={{ r: 3, fill: color }}
                    activeDot={{ r: 5 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}