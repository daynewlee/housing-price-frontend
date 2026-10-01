"use client";

import { useState } from "react";
import { PropertyRecord, HistoryResponse, PropertyFormData } from "@/lib/schemas";
import { submitEstimate, fetchComparison } from "@/lib/api";
import EstimateForm from "./EstimateForm";
import HistoryTable from "./HistoryTable";
import PriceChart from "./PriceChart";
import PropertyComparison from "./PropertyComparison";

export default function DashboardContainer({ initialData }: { initialData: HistoryResponse }) {
  const [activeTab, setActiveTab] = useState<"estimate" | "history" | "compare">("estimate");
  const [records, setRecords] = useState<PropertyRecord[]>(initialData.records || []);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [comparisonData, setComparisonData] = useState<PropertyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [latestEstimate, setLatestEstimate] = useState<PropertyRecord | null>(null);

  // Form Submission Handler
  const handleFormSubmit = async (formData: PropertyFormData) => {
    setLoading(true);
    try {
      const created = await submitEstimate(formData);
      setLatestEstimate(created);
      setRecords((prev) => [created, ...prev]);
    } catch (err) {
      alert("Error generating estimate: " + err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle selection for comparison (Enforcing max 3 rule)
  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  // Switch to comparison tab and fetch details
  const handleOpenComparison = async () => {
    if (selectedIds.length < 2) {
      alert("Please select at least 2 properties from history first.");
      return;
    }
    try {
      const res = await fetchComparison(selectedIds);
      setComparisonData(res.properties);
      setActiveTab("compare");
    } catch (err) {
      alert("Error loading comparison: " + err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation (Simplified) */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab("estimate")}
          className={`py-2 px-4 text-sm font-semibold border-b-2 transition ${
            activeTab === "estimate" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          1. Valuation Form
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`py-2 px-4 text-sm font-semibold border-b-2 transition ${
            activeTab === "history" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          2. History & Analytics ({records.length})
        </button>
        <button
          onClick={handleOpenComparison}
          className={`py-2 px-4 text-sm font-semibold border-b-2 transition ${
            activeTab === "compare" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          3. Side-by-Side Compare ({selectedIds.length}/3)
        </button>
      </div>

      {/* Tab 1: Form & Latest Instant Result */}
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
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">Successfully Predicted</span>
                  <p className="text-xs text-slate-500">{latestEstimate.property_name}</p>
                  <p className="text-3xl font-extrabold text-blue-600">${latestEstimate.predicted_price.toLocaleString()}</p>
                  <p className="text-[11px] text-slate-400">Persisted into SQLite Database at {new Date(latestEstimate.created_at).toLocaleTimeString()}</p>
                  <button
                    onClick={() => setActiveTab("history")}
                    className="w-full mt-4 text-xs font-semibold py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded"
                  >
                    View All in History Table &rarr;
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mt-4">Fill out the form and submit to calculate live property value.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Tabular & Visual Chart Analysis */}
      {activeTab === "history" && (
        <div className="space-y-6">
          <PriceChart records={records} />

          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-700">Estimate History ({records.length} records)</h3>
            <button
              onClick={handleOpenComparison}
              disabled={selectedIds.length < 2}
              className="text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-3 py-1.5 rounded font-medium transition"
            >
              Compare Selected ({selectedIds.length}/3)
            </button>
          </div>

          <HistoryTable records={records} selectedIds={selectedIds} onToggleSelect={handleToggleSelect} />
        </div>
      )}

      {/* Tab 3: Side-by-Side Compare */}
      {activeTab === "compare" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-700">Direct Property Comparison (Max 3)</h3>
            <button onClick={() => setActiveTab("history")} className="text-xs text-blue-600 hover:underline">
              &larr; Change Selection
            </button>
          </div>
          <PropertyComparison properties={comparisonData} />
        </div>
      )}
    </div>
  );
}
