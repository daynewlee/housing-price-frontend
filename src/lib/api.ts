import { PropertyFormData, PropertyRecord, HistoryResponse } from "./schemas";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchInitialHistory(page = 1, pageSize = 25): Promise<HistoryResponse> {
  const res = await fetch(`${BASE_URL}/api/estimates/history?page=${page}&page_size=${pageSize}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load estimate history");
  return res.json();
}

export async function submitEstimate(data: PropertyFormData): Promise<PropertyRecord> {
  const res = await fetch(`${BASE_URL}/api/estimates/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to submit property estimate");
  return res.json();
}

export async function fetchComparison(ids: number[]): Promise<{ properties: PropertyRecord[] }> {
  const res = await fetch(`${BASE_URL}/api/estimates/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estimate_ids: ids }),
  });
  if (!res.ok) throw new Error("Failed to load comparison data");
  return res.json();
}
