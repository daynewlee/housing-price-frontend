"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { propertyFormSchema, PropertyFormData } from "@/lib/schemas";

interface EstimateFormProps {
  onSubmit: (data: PropertyFormData) => Promise<void>;
  loading: boolean;
}

export default function EstimateForm({ onSubmit, loading }: EstimateFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      property_name: "Suburban Family Home",
      square_footage: 1850,
      bedrooms: 3,
      bathrooms: 2,
      year_built: 2005,
      lot_size: 7200,
      distance_to_city_center: 4.5,
      school_rating: 8.0,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
      <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Property Details</h2>
      
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Property Name / Label</label>
        <input {...register("property_name")} className="w-full text-sm border rounded px-3 py-2 border-slate-300 focus:outline-blue-500" />
        {errors.property_name && <p className="text-xs text-red-500 mt-1">{errors.property_name.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Square Footage (sq ft)</label>
          <input type="number" step="any" {...register("square_footage")} className="w-full text-sm border rounded px-3 py-2 border-slate-300" />
          {errors.square_footage && <p className="text-xs text-red-500 mt-1">{errors.square_footage.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Lot Size (sq ft)</label>
          <input type="number" step="any" {...register("lot_size")} className="w-full text-sm border rounded px-3 py-2 border-slate-300" />
          {errors.lot_size && <p className="text-xs text-red-500 mt-1">{errors.lot_size.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Bedrooms</label>
          <input type="number" {...register("bedrooms")} className="w-full text-sm border rounded px-3 py-2 border-slate-300" />
          {errors.bedrooms && <p className="text-xs text-red-500 mt-1">{errors.bedrooms.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Bathrooms</label>
          <input type="number" step="0.5" {...register("bathrooms")} className="w-full text-sm border rounded px-3 py-2 border-slate-300" />
          {errors.bathrooms && <p className="text-xs text-red-500 mt-1">{errors.bathrooms.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Year Built</label>
          <input type="number" {...register("year_built")} className="w-full text-sm border rounded px-3 py-2 border-slate-300" />
          {errors.year_built && <p className="text-xs text-red-500 mt-1">{errors.year_built.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Distance to City Center</label>
          <input type="number" step="0.1" {...register("distance_to_city_center")} className="w-full text-sm border rounded px-3 py-2 border-slate-300" />
          {errors.distance_to_city_center && <p className="text-xs text-red-500 mt-1">{errors.distance_to_city_center.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">School Rating (0 - 10)</label>
        <input type="number" step="0.1" {...register("school_rating")} className="w-full text-sm border rounded px-3 py-2 border-slate-300" />
        {errors.school_rating && <p className="text-xs text-red-500 mt-1">{errors.school_rating.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded transition disabled:bg-blue-300"
      >
        {loading ? "Calculating Valuation..." : "Predict Valuation & Save"}
      </button>
    </form>
  );
}
