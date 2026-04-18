import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { Landmark, Activity, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

// Type definitions for expected API responses
interface BudgetSummary {
  fiscal_year: string;
  total_budget_crore: number;
  num_states: number;
  avg_hdi_score: number;
  states_with_anomalies: number;
  sector_breakdown: Record<string, number>;
  sector_percentages: Record<string, number>;
}

async function getDashboardData() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/budget/summary", {
      cache: "no-store", // Ensure we fetch real-time fresh data
    });
    if (!res.ok) return null;
    const summary: BudgetSummary = await res.json();
    return { summary };
  } catch (error) {
    console.error("Backend unreachable, falling back to static data", error);
    return null;
  }
}

export default async function GovDashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/gov-sign-in");
  }

  const apiData = await getDashboardData();
  
  // Dynamic or static fallback variables
  // Convert Crore to Lakh Crore (L Cr) by dividing by 1,00,000
  const totalLakhCrore = apiData?.summary?.total_budget_crore 
    ? (apiData.summary.total_budget_crore / 100000).toFixed(2) 
    : "50.65";
  
  const formattedFiscalYear = apiData?.summary?.fiscal_year || "2025-26";

  // Dummy utilisation derived from total budget (e.g. 58%) 
  const utilisationAmt = (parseFloat(totalLakhCrore) * 0.584).toFixed(2);
  const percentUtilized = "58.4";

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-teal-500 selection:text-slate-900">
      {/* Navbar */}
      <nav className="w-full bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.3)] text-slate-900 font-bold">
               <Landmark className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">Connect Engine</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className={`border px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                apiData ? "bg-teal-500/10 border-teal-500/20 text-teal-400" : "bg-orange-500/10 border-orange-500/20 text-orange-400"
              }`}
            >
               <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${apiData ? "bg-teal-400" : "bg-orange-400"}`} /> 
               {apiData ? "ENGINE ACTIVE" : "ENGINE DISCONNECTED"}
            </div>
            <UserButton appearance={{ elements: { avatarBox: "w-10 h-10 ring-2 ring-slate-700" } }} />
          </div>
        </div>
      </nav>

      {/* Dashboard Body */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">Executive Summary</h1>
          <p className="text-slate-400 font-medium text-lg">System standing as of current fiscal quarter. Real-time monitoring enabled.</p>
        </div>

        {/* Top summary row */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Total Budget */}
          <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-lg relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Total Budget {formattedFiscalYear}</p>
            <p className="text-[40px] leading-tight font-black text-white mb-1">₹{totalLakhCrore}<span className="text-xl text-slate-500 font-bold ml-1">L Cr</span></p>
            <p className="text-blue-400 text-sm font-bold mt-2 flex items-center gap-1">Union Allocation</p>
          </div>

          {/* Utilisation */}
          <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-lg relative overflow-hidden ring-1 ring-orange-500/20">
            <div className="absolute right-0 bottom-0 top-0 w-2 bg-gradient-to-b from-orange-400 to-orange-600 shadow-[0_0_15px_rgba(249,115,22,0.8)]" />
            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Utilisation So Far</p>
            <p className="text-[40px] leading-tight font-black text-white mb-1">₹{utilisationAmt}<span className="text-xl text-slate-500 font-bold ml-1">L Cr</span></p>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex-1 bg-slate-900 h-2 rounded-full overflow-hidden">
                 <div className="bg-orange-500 h-full rounded-full" style={{ width: `${percentUtilized}%` }} />
              </div>
              <p className="text-orange-400 text-sm font-black tracking-wide">{percentUtilized}% utilized</p>
            </div>
          </div>

          {/* Fiscal Deficit */}
          <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-lg position relative overflow-hidden">
             <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-teal-500/10 blur-3xl rounded-full pointer-events-none" />
            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Fiscal Deficit</p>
            <p className="text-[40px] leading-tight font-black text-white mb-1">4.4%<span className="text-xl text-slate-500 font-bold ml-1">of GDP</span></p>
            <p className="text-teal-400 text-sm font-bold mt-2">Target Estimate Range</p>
          </div>
        </div>

        {apiData && (
          <div className="bg-slate-800/50 p-6 rounded-2xl mb-12 border border-slate-700/50">
             <h3 className="text-xl font-bold text-white mb-4">Top Allocated Sectors</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {Object.entries(apiData.summary.sector_percentages)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 4)
                  .map(([name, pct]) => (
                    <div key={name} className="bg-slate-900/40 p-4 rounded-xl">
                      <p className="text-sm text-slate-400 capitalize mb-1">{name.replace(/_/g, ' ')}</p>
                      <p className="text-xl text-white font-bold">{pct}%</p>
                    </div>
               ))}
             </div>
          </div>
        )}

        {/* Urgent Action Areas */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Red Flag Sectors */}
          <div className="bg-rose-950/10 border border-rose-900/40 rounded-[28px] p-8 shadow-inner relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-3xl" />
             <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-500 text-2xl shadow-[0_0_20px_rgba(244,63,94,0.15)] outline outline-1 outline-rose-500/30">
                  ⚠️
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">Sectors Needing Attention</h3>
             </div>
             
             <div className="space-y-4 relative z-10">
                <div className="bg-slate-900/60 p-5 rounded-2xl border border-rose-900/30 hover:border-rose-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                     <span className="font-bold text-lg text-slate-200">Education</span>
                     <span className="text-rose-400 bg-rose-950/50 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-rose-900/50">High Risk</span>
                  </div>
                  <p className="text-slate-400 font-medium">Only <strong className="text-white">34% utilized</strong> with 6 months left. Historical data indicates a severe lapse risk.</p>
                </div>
                
                <div className="bg-slate-900/60 p-5 rounded-2xl border border-rose-900/30 hover:border-rose-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                     <span className="font-bold text-lg text-slate-200">Rural Development</span>
                     <span className="text-orange-400 bg-orange-950/50 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-orange-900/50">Overspent</span>
                  </div>
                  <p className="text-slate-400 font-medium">Currently overspent by <strong className="text-white">₹0.8L Cr</strong> relative to Q3 target margins.</p>
                </div>
             </div>
          </div>

          {/* On Track Sectors */}
          <div className="bg-emerald-950/10 border border-emerald-900/40 rounded-[28px] p-8 shadow-inner relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl" />
             <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 text-2xl shadow-[0_0_20px_rgba(16,185,129,0.15)] outline outline-1 outline-emerald-500/30">
                  ✅
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">Sectors On Track</h3>
             </div>
             
             <div className="space-y-4 relative z-10">
                <div className="bg-slate-900/60 p-5 rounded-2xl border border-emerald-900/20 hover:border-emerald-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-lg text-slate-200">Defence</span>
                    <span className="text-emerald-400 bg-emerald-950/50 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-900/50">Stable</span>
                  </div>
                  <p className="text-slate-400 font-medium">Capital procurement standing at <strong className="text-white">62%</strong> executed. Operating exactly within range.</p>
                </div>
                
                <div className="bg-slate-900/60 p-5 rounded-2xl border border-emerald-900/20 hover:border-emerald-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-lg text-slate-200">Infrastructure (Capex)</span>
                    <span className="text-emerald-400 bg-emerald-950/50 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-900/50">Stable</span>
                  </div>
                  <p className="text-slate-400 font-medium">Highway disbursements hit <strong className="text-white">55% utilized</strong>. No optimization necessary.</p>
                </div>
             </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-center mb-8">
          <button className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-900 px-12 py-6 rounded-2xl font-black text-xl transition-all duration-300 shadow-[0_15px_50px_rgba(20,184,166,0.3)] flex items-center gap-3 hover:-translate-y-1 ring-4 ring-teal-500/20">
            Get AI Optimization Suggestions &rarr;
          </button>
        </div>
      </main>
    </div>
  );
}

