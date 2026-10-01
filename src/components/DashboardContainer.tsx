"use client";

import { useState } from "react";
import { PropertyRecord, HistoryResponse, PropertyFormData } from "@/lib/schemas";
import { submitEstimate, fetchInitialHistory, fetchComparison } from "@/lib/api";
import EstimateForm from "./EstimateForm";
import HistoryTable from "./HistoryTable";
import PriceChart from "./PriceChart";
import PropertyComparison from "./PropertyComparison";

export default function DashboardContainer({ initialData }: { initialData: HistoryResponse }) {
  const [activeTab, setActiveTab] = useState<"estimate" | "history" | "compare">("estimate");
  const [records, setRecords] = useState<PropertyRecord[]>(initialData?.records || []);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [comparisonData, setComparisonData] = useState<PropertyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [latestEstimate, setLatestEstimate] = useState<PropertyRecord | null>(null);

  // 表单提交后同步最新历史
  const handleFormSubmit = async (formData: PropertyFormData) => {
    setLoading(true);
    try {
      const created = await submitEstimate(formData);
      setLatestEstimate(created);
      
      // 重新同步完整列表，确保拿到后端刚落库生成的 id 和 timestamp
      const freshHistory = await fetchInitialHistory(1, 25);
      setRecords(freshHistory.records || [created, ...records]);
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

  const onTabChange = (tab: "estimate" | "history" | "compare") => {
    setActiveTab(tab);
    if (tab === "compare" && selectedIds.length >= 2) {
      triggerComparison(selectedIds);
    }
  };

  return (
    <div className="space-y-6">
      {/* 3 个 Tab 全部直接可以点击切换 */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => onTabChange("estimate")}
          className={`py-2 px-4 text-sm font-semibold border-b-2 transition ${
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
          className={`py-2 px-4 text-sm font-semibold border-b-2 transition ${
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
          className={`py-2 px-4 text-sm font-semibold border-b-2 transition ${
            activeTab === "compare"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          3. Side-by-Side Compare ({selectedIds.length}/3)
        </button>
      </div>

      {/* Tab 1: Form */}
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
                  Fill out the form and submit to calculate live property value.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: History & Chart */}
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
              className="text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-3 py-1.5 rounded font-medium transition"
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

      {/* Tab 3: Comparison */}
      {activeTab === "compare" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-700">Direct Comparison</h3>
            <button
              type="button"
              onClick={() => onTabChange("history")}
              className="text-xs text-blue-600 hover:underline"
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
    </div>
  );
}