"use client";

import { useState } from "react";
import { PropertyRecord, HistoryResponse, PropertyFormData } from "@/lib/schemas";
import { submitEstimate, fetchInitialHistory, fetchComparison } from "@/lib/api";
import {
  fetchDistanceAggregates,
  fetchYearAggregates,
  fetchMarketProperties,
  refreshMarketCache,
  AggregateStats,
  MarketProperty,
  MarketFilterParams,
} from "@/lib/marketApi";

import EstimateForm from "./EstimateForm";
import HistoryTable from "./HistoryTable";
import PriceChart from "./PriceChart";
import PropertyComparison from "./PropertyComparison";
import MarketCharts from "./market/MarketCharts";
import MarketTableView from "./market/MarketTableView";

export default function DashboardContainer({ initialData }: { initialData: HistoryResponse }) {
  const [activeTab, setActiveTab] = useState<"estimate" | "history" | "compare" | "market">("estimate");
  const [records, setRecords] = useState<PropertyRecord[]>(initialData?.records || []);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [comparisonData, setComparisonData] = useState<PropertyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [latestEstimate, setLatestEstimate] = useState<PropertyRecord | null>(null);

  // Java 后端状态 (Task 2)
  const [distanceStats, setDistanceStats] = useState<AggregateStats[]>([]);
  const [yearStats, setYearStats] = useState<AggregateStats[]>([]);
  const [marketProperties, setMarketProperties] = useState<MarketProperty[]>([]);
  const [marketLoading, setMarketLoading] = useState(false);

  // 表单提交后同步最新历史 (Python)，并静默刷新 Java 端 LRU 缓存
  const handleFormSubmit = async (formData: PropertyFormData) => {
    setLoading(true);
    try {
      const created = await submitEstimate(formData);
      setLatestEstimate(created);

      // 重新同步 Python 完整列表
      const freshHistory = await fetchInitialHistory(1, 25);
      setRecords(freshHistory.records || [created, ...records]);

      // 异步通知 Java 后端清理缓存，下次访问 Market Tab 自动拉取最新数据
      refreshMarketCache().catch((err) => console.warn("Java cache eviction skipped:", err));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  // 进入 Compare 页面时触发加载
  const triggerComparison = async (ids: number[]) => {
    if (ids.length < 2) return;
    try {
      const res = await fetchComparison(ids);
      setComparisonData(res.properties);
    } catch (e) {
      console.error("Comparison fetch failed:", e);
    }
  };

  // 加载 Java Spring Boot 市场分析数据 (Task 2)
  const loadMarketData = async (params: MarketFilterParams = { sortBy: "price" }) => {
    setMarketLoading(true);
    try {
      const [distRes, yearRes, propList] = await Promise.all([
        fetchDistanceAggregates(),
        fetchYearAggregates(),
        fetchMarketProperties(params),
      ]);

      setDistanceStats(distRes.aggregates || []);
      setYearStats(yearRes.aggregates || []);
      setMarketProperties(propList || []);
    } catch (err) {
      console.error("Failed to load data from Java backend:", err);
    } finally {
      setMarketLoading(false);
    }
  };

  const handleRefreshMarketCache = async () => {
    try {
      await refreshMarketCache();
      await loadMarketData();
    } catch (e) {
      console.error("Cache refresh failed:", e);
    }
  };

  const onTabChange = (tab: "estimate" | "history" | "compare" | "market") => {
    setActiveTab(tab);
    if (tab === "compare" && selectedIds.length >= 2) {
      triggerComparison(selectedIds);
    }
    if (tab === "market") {
      loadMarketData();
    }
  };

  return (
    <div className="space-y-6">
      {/* 4 个 Tab 导航栏 */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => onTabChange("estimate")}
          className={`py-2 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
            activeTab === "estimate"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          1. Valuation Form
        </button>

        <button
          type="button"
          onClick={() => onTabChange("history")}
          className={`py-2 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
            activeTab === "history"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          2. History & Analytics ({records.length})
        </button>

        <button
          type="button"
          onClick={() => onTabChange("compare")}
          className={`py-2 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
            activeTab === "compare"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          3. Side-by-Side Compare ({selectedIds.length}/3)
        </button>

        <button
          type="button"
          onClick={() => onTabChange("market")}
          className={`py-2 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === "market"
              ? "border-indigo-600 text-indigo-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          4. Market Analysis (Java)
        </button>
      </div>

      {/* Tab 1: Valuation Form (Python API) */}
      {activeTab === "estimate" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <EstimateForm onSubmit={handleFormSubmit} loading={loading} />
          </div>
          <div>
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm sticky top-6">
              <h3 className="text-sm font-bold text-slate-700 border-b pb-2">Latest Valuation Output</h3>
              {latestEstimate ? (
                <div className="mt-4 space-y-3">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">
                    Successfully Calculated
                  </span>
                  <p className="text-sm font-semibold text-slate-800">{latestEstimate.property_name}</p>
                  <p className="text-3xl font-extrabold text-blue-600">
                    ${latestEstimate.predicted_price?.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    ID #{latestEstimate.id} saved to SQLite
                  </p>
                  <button
                    type="button"
                    onClick={() => onTabChange("history")}
                    className="w-full mt-4 text-xs font-semibold py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded transition"
                  >
                    View in History Table &rarr;
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mt-4">
                  Fill out the form and submit to calculate live property value via Python ML inference.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: History & Chart (Python API) */}
      {activeTab === "history" && (
        <div className="space-y-6">
          <PriceChart records={records} />

          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-700">Estimate History ({records.length} records)</h3>
            <button
              type="button"
              onClick={() => {
                if (selectedIds.length >= 2) {
                  onTabChange("compare");
                }
              }}
              disabled={selectedIds.length < 2}
              className="text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-3 py-1.5 rounded font-medium transition cursor-pointer"
            >
              Compare Selected ({selectedIds.length}/3)
            </button>
          </div>

          <HistoryTable
            records={records}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
          />
        </div>
      )}

      {/* Tab 3: Comparison (Python API) */}
      {activeTab === "compare" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-700">Direct Comparison</h3>
            <button
              type="button"
              onClick={() => onTabChange("history")}
              className="text-xs text-blue-600 hover:underline cursor-pointer"
            >
              &larr; Back to History to change selection
            </button>
          </div>

          {selectedIds.length < 2 ? (
            <div className="bg-white p-8 text-center rounded-lg border border-slate-200 text-slate-500 text-sm">
              Please select at least 2 properties (max 3) from the <strong>History</strong> tab to compare.
            </div>
          ) : (
            <PropertyComparison properties={comparisonData} />
          )}
        </div>
      )}

      {/* Tab 4: Market Analysis & Aggregation (Java Spring Boot API) */}
      {activeTab === "market" && (
        <div className="space-y-6">
          {/* 需求 i: 距离与建成年份聚合图表 */}
          <MarketCharts distanceStats={distanceStats} yearStats={yearStats} />

          {/* 需求 ii, iv, v: 过滤器、CSV/PDF 导出与响应式排序表格 */}
          <MarketTableView
            properties={marketProperties}
            onFilterChange={loadMarketData}
            onRefresh={handleRefreshMarketCache}
            loading={marketLoading}
          />
        </div>
      )}
    </div>
  );
}