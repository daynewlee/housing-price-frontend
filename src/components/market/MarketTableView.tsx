"use client";

import { useState } from "react";
import { MarketProperty, MarketFilterParams } from "@/lib/marketApi";
import { exportToCSV, exportTableToPDF } from "@/lib/exportUtils";

interface MarketTableViewProps {
  properties: MarketProperty[];
  onFilterChange: (filters: MarketFilterParams) => void;
  onRefresh: () => void;
  loading: boolean;
}

export default function MarketTableView({
  properties,
  onFilterChange,
  onRefresh,
  loading,
}: MarketTableViewProps) {
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minBedrooms, setMinBedrooms] = useState("");
  const [sortBy, setSortBy] = useState("price");

  const handleApplyFilter = () => {
    onFilterChange({
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minBedrooms: minBedrooms ? Number(minBedrooms) : undefined,
      sortBy,
    });
  };

  const handleReset = () => {
    setMinPrice("");
    setMaxPrice("");
    setMinBedrooms("");
    setSortBy("price");
    onFilterChange({ sortBy: "price" });
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
      {/* 顶部标题与导出工具 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Market Property Segments</h2>
          <p className="text-xs text-slate-500">Filtered and sorted in-memory via Java Spring Boot</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded bg-white hover:bg-slate-50 text-slate-700"
          >
            Refresh Cache
          </button>
          <button
            type="button"
            onClick={() => exportToCSV(properties)}
            disabled={!properties.length}
            className="px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded transition disabled:bg-slate-300"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => exportTableToPDF("printable-market-table")}
            disabled={!properties.length}
            className="px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded transition disabled:bg-slate-300"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* 过滤条 (Requirement ii) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-md text-xs">
        <div>
          <label className="block text-slate-600 font-medium mb-1">Min Price ($)</label>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="0"
            className="w-full border rounded px-2.5 py-1.5 bg-white text-slate-900 border-slate-300"
          />
        </div>
        <div>
          <label className="block text-slate-600 font-medium mb-1">Max Price ($)</label>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="No Limit"
            className="w-full border rounded px-2.5 py-1.5 bg-white text-slate-900 border-slate-300"
          />
        </div>
        <div>
          <label className="block text-slate-600 font-medium mb-1">Min Bedrooms</label>
          <select
            value={minBedrooms}
            onChange={(e) => setMinBedrooms(e.target.value)}
            className="w-full border rounded px-2.5 py-1.5 bg-white text-slate-900 border-slate-300"
          >
            <option value="">Any</option>
            <option value="1">1+ Beds</option>
            <option value="2">2+ Beds</option>
            <option value="3">3+ Beds</option>
            <option value="4">4+ Beds</option>
          </select>
        </div>
        <div>
          <label className="block text-slate-600 font-medium mb-1">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full border rounded px-2.5 py-1.5 bg-white text-slate-900 border-slate-300"
          >
            <option value="price">Price (Low to High)</option>
            <option value="price_desc">Price (High to Low)</option>
            <option value="year">Year Built (Newest)</option>
            <option value="distance">Distance (Closest)</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={handleApplyFilter}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 rounded transition"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-200 transition"
          >
            Reset
          </button>
        </div>
      </div>

      {/* 响应式数据表格 (Requirement v) */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg" id="printable-market-table">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
            <tr>
              <th className="px-4 py-3">Property</th>
              <th className="px-4 py-3">Estimated Price</th>
              <th className="px-4 py-3">Size</th>
              <th className="px-4 py-3">Beds / Baths</th>
              <th className="px-4 py-3">Year</th>
              <th className="px-4 py-3">Distance</th>
              <th className="px-4 py-3">School Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">
                  Loading market data...
                </td>
              </tr>
            ) : properties.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">
                  No properties match the selected criteria.
                </td>
              </tr>
            ) : (
              properties.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-semibold text-slate-900">{p.property_name}</td>
                  <td className="px-4 py-3 font-bold text-blue-600">
                    ${Math.round(p.predicted_price).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{p.square_footage.toLocaleString()} sq ft</td>
                  <td className="px-4 py-3">
                    {p.bedrooms} bd / {p.bathrooms} ba
                  </td>
                  <td className="px-4 py-3">{p.year_built}</td>
                  <td className="px-4 py-3">{p.distance_to_city_center} mi</td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">
                      {p.school_rating} / 10
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}