import { z } from "zod";

// Helper for numeric inputs that converts empty string to NaN/undefined for clean error messages
const numericField = (label: string, min = 0, max?: number) => {
  let rule = z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number({ invalid_type_error: `${label} is required and must be a number` })
  );

  if (min > 0) {
    rule = rule.refine((v) => v >= min, { message: `${label} must be at least ${min}` });
  } else {
    rule = rule.refine((v) => v >= 0, { message: `${label} cannot be negative` });
  }

  if (max !== undefined) {
    rule = rule.refine((v) => v <= max, { message: `${label} cannot exceed ${max}` });
  }

  return rule;
};

export const propertyFormSchema = z.object({
  property_name: z.string().trim().min(1, "Property name is required"),
  square_footage: numericField("Square footage", 1),
  bedrooms: numericField("Bedrooms", 0).refine((v) => Number.isInteger(v), { message: "Bedrooms must be an integer" }),
  bathrooms: numericField("Bathrooms", 0),
  year_built: numericField("Year built", 1801, 2026).refine((v) => Number.isInteger(v), { message: "Year must be an integer" }),
  lot_size: numericField("Lot size", 1),
  distance_to_city_center: numericField("Distance to city center", 0),
  school_rating: numericField("School rating", 0, 10),
});

export type PropertyFormData = z.infer<typeof propertyFormSchema>;

export interface PropertyRecord extends PropertyFormData {
  id: number;
  predicted_price: number;
  currency: string;
  created_at: string;
}

export interface HistoryResponse {
  total_records: number;
  page: number;
  page_size: number;
  total_pages: number;
  records: PropertyRecord[];
}

export interface WhatIfPropertyProjection {
  id: number;
  propertyName: string;
  currentPrice: number;
  projectedPrice: number;
  projectedGain: number;
  estimatedMonthlyMortgage: number;
  squareFootage: number;
  bedrooms: number;
}

export interface WhatIfResponse {
  status: "SUCCESS" | "NO_DATA";
  scenario: string;
  sampleSize?: number;
  macroAssumptions?: {
    yearsAhead: number;
    annualInflationRate: string;
    averageMortgageRate: string;
    cumulativeGrowthMultiplier: number;
  };
  summary?: {
    avgCurrentPrice: number;
    avgProjectedPrice: number;
    overallAppreciationPct: string;
  };
  projections?: WhatIfPropertyProjection[];
  message?: string;
}

export interface WhatIfQueryParams {
  scenarioName?: string;
  yearsAhead?: number;
  inflationRate?: number;
  mortgageRate?: number;
}

export async function fetchWhatIfAnalysis(params?: WhatIfQueryParams): Promise<WhatIfResponse> {
  const res = await fetch(`${JAVA_API_BASE}/api/market/what-if`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      scenario_name: params?.scenarioName || "5-Year Macro Outlook",
      years_ahead: params?.yearsAhead ?? 5,
      inflation_rate: params?.inflationRate ?? 3.0,
      mortgage_rate: params?.mortgageRate ?? 5.5,
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch What-If macro analysis");
  return res.json();
}