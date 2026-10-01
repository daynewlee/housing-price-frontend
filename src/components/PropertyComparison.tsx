"use client";

import { PropertyRecord } from "@/lib/schemas";

export default function PropertyComparison({ properties }: { properties: PropertyRecord[] }) {
  if (properties.length < 2) {
    return (
      <div className="bg-white p-8 text-center rounded-lg border border-slate-200 text-slate-500">
        Please check at least 2 properties (max 3) in the History tab to run side-by-side analysis.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {properties.map((p) => (
        <div key={p.id} className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="border-b pb-2">
            <span className="text-[10px] uppercase font-bold text-slate-400">ID #{p.id}</span>
            <h4 className="font-bold text-slate-800 text-base">{p.property_name}</h4>
            <p className="text-xl font-extrabold text-blue-600 mt-1">${p.predicted_price.toLocaleString()}</p>
          </div>

          <div className="text-xs space-y-2 text-slate-600">
            <div className="flex justify-between"><span>Living Area:</span><span className="font-semibold">{p.square_footage} sqft</span></div>
            <div className="flex justify-between"><span>Lot Size:</span><span className="font-semibold">{p.lot_size} sqft</span></div>
            <div className="flex justify-between"><span>Bedrooms / Bath:</span><span className="font-semibold">{p.bedrooms} / {p.bathrooms}</span></div>
            <div className="flex justify-between"><span>Year Built:</span><span className="font-semibold">{p.year_built}</span></div>
            <div className="flex justify-between"><span>Distance to City:</span><span className="font-semibold">{p.distance_to_city_center} mi</span></div>
            <div className="flex justify-between"><span>School Rating:</span><span className="font-semibold">{p.school_rating} / 10</span></div>
          </div>
        </div>
      ))}
    </div>
  );
}
