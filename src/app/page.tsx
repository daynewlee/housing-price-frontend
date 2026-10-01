import { fetchInitialHistory } from "@/lib/api";
import DashboardContainer from "@/components/DashboardContainer";

// Force dynamic execution so SSR always fetches the freshest DB records
export const dynamic = "force-dynamic";

export default async function Home() {
  let initialHistory = {
    total_records: 0,
    page: 1,
    page_size: 10,
    total_pages: 1,
    records: [],
  };

  try {
    // Requirement: React Server Components for initial data loading
    initialHistory = await fetchInitialHistory(1, 10);
  } catch (error) {
    console.error("Failed to load initial estimate history on server:", error);
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="border-b border-slate-200 pb-5">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Property Value Estimator
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Real-time residential property valuation powered by machine learning, featuring instant calculation, interactive analytics, and side-by-side comparison.
          </p>
        </header>

        {/* Client interactive shell hydrated with SSR data */}
        <DashboardContainer initialData={initialHistory} />
      </div>
    </main>
  );
}
