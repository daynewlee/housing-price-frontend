"use client";

import { PropertyRecord } from "@/lib/schemas";

interface HistoryTableProps {
  records: PropertyRecord[];
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
}

export default function HistoryTable({ records, selectedIds, onToggleSelect }: HistoryTableProps) {
  if (records.length === 0) {
    return <div className="p-8 text-center text-slate-400 bg-white rounded border">No history found. Create your first valuation above.</div>;
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 border-b text-slate-600 font-semibold uppercase">
          <tr>
            <th className="p-3 text-center">Compare</th>
            <th className="p-3">Property</th>
            <th className="p-3">Price</th>
            <th className="p-3">Area</th>
            <th className="p-3">Bed/Bath</th>
            <th className="p-3">Built</th>
            <th className="p-3">Distance</th>
            <th className="p-3">School</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {records.map((row) => {
            const isSelected = selectedIds.includes(row.id);
            return (
              <tr key={row.id} className={isSelected ? "bg-blue-50/50" : "hover:bg-slate-50"}>
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(row.id)}
                    disabled={!isSelected && selectedIds.length >= 3}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="p-3 font-medium text-slate-800">{row.property_name}</td>
                <td className="p-3 font-semibold text-blue-600">${row.predicted_price.toLocaleString()}</td>
                <td className="p-3">{row.square_footage} sqft</td>
                <td className="p-3">{row.bedrooms}b / {row.bathrooms}ba</td>
                <td className="p-3">{row.year_built}</td>
                <td className="p-3">{row.distance_to_city_center} mi</td>
                <td className="p-3">{row.school_rating}/10</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
