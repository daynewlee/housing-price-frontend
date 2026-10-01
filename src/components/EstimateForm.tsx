"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { propertyFormSchema, PropertyFormData } from "@/lib/schemas";

interface EstimateFormProps {
  onSubmit: (data: PropertyFormData) => Promise<void>;
  loading: boolean;
}

export default function EstimateForm({ onSubmit, loading }: EstimateFormProps) {
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      property_name: "",
      square_footage: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      year_built: undefined,
      lot_size: undefined,
      distance_to_city_center: undefined,
      school_rating: undefined,
    },
  });

  const onValid = async (data: PropertyFormData) => {
    setApiError(null);
    try {
      await onSubmit(data);
    } catch (err: unknown) {
      console.error("API submission error:", err);
      const msg = err instanceof Error ? err.message : "Service unavailable";
      if (msg.includes("503") || msg.includes("Failed to fetch")) {
        setApiError("Service unavailable: Backend or ML model is currently unreachable.");
      } else {
        setApiError("Invalid input: Please verify all fields match expected formats.");
      }
    }
  };

  const onInvalid = (formErrors: typeof errors) => {
    console.warn("Client validation failed:", formErrors);
    setApiError("Invalid input: Please fill in all required fields properly.");
  };

  // Reusable input style ensuring clear black text on white background
  const inputStyle =
    "w-full text-sm border rounded px-3 py-2 border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400";

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
      <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Property Details</h2>

      {apiError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
          {apiError}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Property Name / Label</label>
        <input
          {...register("property_name")}
          placeholder="e.g. Oak Street Villa"
          className={inputStyle}
        />
        {errors.property_name && <p className="text-xs text-red-500 mt-1">{errors.property_name.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Square Footage (sq ft)</label>
          <input
            type="number"
            step="any"
            {...register("square_footage")}
            placeholder="e.g. 1850"
            className={inputStyle}
          />
          {errors.square_footage && <p className="text-xs text-red-500 mt-1">{errors.square_footage.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Lot Size (sq ft)</label>
          <input
            type="number"
            step="any"
            {...register("lot_size")}
            placeholder="e.g. 7200"
            className={inputStyle}
          />
          {errors.lot_size && <p className="text-xs text-red-500 mt-1">{errors.lot_size.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Bedrooms</label>
          <input
            type="number"
            {...register("bedrooms")}
            placeholder="e.g. 3"
            className={inputStyle}
          />
          {errors.bedrooms && <p className="text-xs text-red-500 mt-1">{errors.bedrooms.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Bathrooms</label>
          <input
            type="number"
            step="0.5"
            {...register("bathrooms")}
            placeholder="e.g. 2.5"
            className={inputStyle}
          />
          {errors.bathrooms && <p className="text-xs text-red-500 mt-1">{errors.bathrooms.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Year Built</label>
          <input
            type="number"
            {...register("year_built")}
            placeholder="e.g. 2005"
            className={inputStyle}
          />
          {errors.year_built && <p className="text-xs text-red-500 mt-1">{errors.year_built.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Distance to City Center (miles)</label>
          <input
            type="number"
            step="0.1"
            {...register("distance_to_city_center")}
            placeholder="e.g. 4.5"
            className={inputStyle}
          />
          {errors.distance_to_city_center && <p className="text-xs text-red-500 mt-1">{errors.distance_to_city_center.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">School Rating (0 - 10)</label>
        <input
          type="number"
          step="0.1"
          {...register("school_rating")}
          placeholder="e.g. 8.5"
          className={inputStyle}
        />
        {errors.school_rating && <p className="text-xs text-red-500 mt-1">{errors.school_rating.message}</p>}
      </div>

      <button
        type="button"
        onClick={handleSubmit(onValid, onInvalid)}
        disabled={loading}
        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded transition disabled:bg-blue-300 cursor-pointer"
      >
        {loading ? "Calculating Valuation..." : "Predict Valuation & Save"}
      </button>
    </div>
  );
}