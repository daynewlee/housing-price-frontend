const JAVA_API_BASE = process.env.NEXT_PUBLIC_JAVA_API_URL || "http://localhost:8080";

export interface AggregateStats {
  bucket: string;
  count: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
}

export interface AggregateResponse {
  status: "SUCCESS" | "NO_DATA";
  metric: string;
  aggregates?: AggregateStats[];
  message?: string;
}

export interface MarketProperty {
  id: number;
  property_name: string;
  square_footage: number;
  bedrooms: number;
  bathrooms: number;
  year_built: number;
  lot_size: number;
  distance_to_city_center: number;
  school_rating: number;
  predicted_price: number;
  currency: string;
  created_at: string;
}

export interface MarketFilterParams {
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  sortBy?: string;
}

// ------------------- What-If payload and api -------------------
export interface YearlyTrajectoryPoint {
  year: number;
  yearOffset: number;
  price: number;
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
  trajectory?: YearlyTrajectoryPoint[]; // 5 年逐年预测走势点 (2026 ~ 2031)
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

// ------------------- API 请求函数 -------------------

export async function fetchDistanceAggregates(): Promise<AggregateResponse> {
  const res = await fetch(`${JAVA_API_BASE}/api/market/aggregate/distance`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch distance aggregates");
  return res.json();
}

export async function fetchYearAggregates(): Promise<AggregateResponse> {
  const res = await fetch(`${JAVA_API_BASE}/api/market/aggregate/year`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch construction era aggregates");
  return res.json();
}

export async function fetchMarketProperties(params: MarketFilterParams): Promise<MarketProperty[]> {
  const query = new URLSearchParams();
  if (params.minPrice) query.append("minPrice", params.minPrice.toString());
  if (params.maxPrice) query.append("maxPrice", params.maxPrice.toString());
  if (params.minBedrooms) query.append("minBedrooms", params.minBedrooms.toString());
  if (params.sortBy) query.append("sortBy", params.sortBy);

  const res = await fetch(`${JAVA_API_BASE}/api/market/properties?${query.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch market properties");
  return res.json();
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

export async function refreshMarketCache(): Promise<void> {
  await fetch(`${JAVA_API_BASE}/api/market/cache/refresh`, { method: "POST" });
}