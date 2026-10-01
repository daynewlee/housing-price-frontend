"use client";

import { useState } from "react";
import { submitEstimate } from "@/lib/api";
import { PropertyEstimateInput, PropertyEstimateItem } from "@/lib/schemas";

export function useEstimator(onSuccess?: (newItem: PropertyEstimateItem) => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestEstimate, setLatestEstimate] = useState<PropertyEstimateItem | null>(null);

  const calculateEstimate = async (values: PropertyEstimateInput) => {
    setLoading(true);
    setError(null);
    try {
      const result = await submitEstimate(values);
      setLatestEstimate(result);
      if (onSuccess) onSuccess(result);
      return result;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { calculateEstimate, loading, error, latestEstimate };
}
