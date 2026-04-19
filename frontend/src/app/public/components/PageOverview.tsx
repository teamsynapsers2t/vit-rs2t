"use client";

import React from "react";
import { useBudget } from "../../gov-dashboard/context/BudgetContext";
import { ArrowRight, ShieldCheck, TrendingUp, Building, MapPin, HeartPulse, GraduationCap, Zap, Landmark } from "lucide-react";

interface Props {
  onGoExplore: () => void;
}

export default function PageOverview({ onGoExplore }: Props) {
  const { totalBudget, statesData, totalAllocated } = useBudget();
  const publicTotalAllocated = totalAllocated;

  // Aggregate top level sectors across all states based strictly on Gov Dashboard logic
  const sectorSums: Record<string, number> = {};
  Object.values(statesData).forEach(s => {
    Object.values(s.districts).forEach(dist => {
      Object.entries(dist.sectors).forEach(([secName, secData]) => {
        const val = secData.userAllocated !== null ? secData.userAllocated : 0;
        sectorSums[secName] = (sectorSums[secName] || 0) + val;
      });
    });
  });

  const sortedSectors = Object.entries(sectorSums)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }));

  return (
    <div className="w-full h-full p-4 md:p-8 lg:px-12 max-w-7xl mx-auto space-y-12 pb-24">
      {/* Hero Banner */}
      <section className="bg-[#1C3A2F] text-white rounded-[2rem] p-8 md:p-12 relative overflow-hidden shadow-xl">
         <div className="absolute top-0 right-0 w-96 h-96 bg-[#4CAF7D] rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3"></div>
         <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#2E8B8B] rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/3 -translate-x-1/4"></div>
         
         <div className="relative z-10 max-w-3xl">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm font-mono tracking-widest mb-6 border border-white/20">
             <ShieldCheck className="w-4 h-4 text-[#4CAF7D]" />
             <span>VERIFIED PUBLIC RECORD</span>
           </div>
           
           <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-6">
             Your Tax Money, <br/>
             <span className="text-[#4CAF7D]">Properly Explained.</span>
           </h1>
           
           <p className="text-lg md:text-xl text-[#E8F4ED]/80 md:leading-relaxed mb-10 max-w-2xl font-medium">
             Welcome to the transparent Union Budget 2026-27 dashboard. No jargon, no hidden clauses. Just a crystal clear view of how ₹{publicTotalAllocated.toFixed(2)} Lakh Crore is building India.
           </p>

           <button 
             onClick={onGoExplore}
             className="bg-[#4CAF7D] hover:bg-[#3fa06e] text-[#1C3A2F] px-8 py-4 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(76,175,125,0.4)] flex items-center gap-2 group text-lg"
           >
             Explore The Budget <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
           </button>
         </div>
      </section>

      {/* KPI Cards */}
      <section className="grid md:grid-cols-3 gap-6">
         <div className="bg-white border border-[#2E5E45]/10 rounded-3xl p-8 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-[#E8F4ED] rounded-2xl flex items-center justify-center mb-6">
               <Landmark className="w-6 h-6 text-[#2E5E45]" />
            </div>
            <p className="text-[#5b7a6b] font-bold text-sm uppercase tracking-wide mb-2">Total Budget Size</p>
            <h2 className="text-4xl font-serif font-bold text-[#1C3A2F] mb-1">₹{publicTotalAllocated.toFixed(2)} L Cr</h2>
            <p className="text-sm font-medium text-[#4CAF7D] bg-[#E8F4ED] inline-block px-2 py-1 rounded">100% Accounted For</p>
         </div>

         <div className="bg-white border border-[#2E5E45]/10 rounded-3xl p-8 hover:shadow-lg transition-shadow relative overflow-hidden">
            <div className="w-12 h-12 bg-[#E8F4ED] rounded-2xl flex items-center justify-center mb-6">
               <Building className="w-6 h-6 text-[#2E5E45]" />
            </div>
            <p className="text-[#5b7a6b] font-bold text-sm uppercase tracking-wide mb-2">Largest Focus Area</p>
            <h2 className="text-3xl font-serif font-bold text-[#1C3A2F] mb-1 truncate">{sortedSectors[0]?.name || "N/A"}</h2>
            <p className="text-sm font-medium text-[#2E8B8B] bg-[#E8F4ED] inline-block px-2 py-1 rounded">₹{sortedSectors[0]?.value.toFixed(2)} L Cr</p>
            <TrendingUp className="absolute -bottom-4 -right-4 w-32 h-32 text-[#E8F4ED] opacity-30" />
         </div>

         <div className="bg-white border border-[#2E5E45]/10 rounded-3xl p-8 hover:shadow-lg transition-shadow relative">
            <div className="w-12 h-12 bg-[#E8F4ED] rounded-2xl flex items-center justify-center mb-6">
               <MapPin className="w-6 h-6 text-[#2E5E45]" />
            </div>
            <p className="text-[#5b7a6b] font-bold text-sm uppercase tracking-wide mb-2">Local Impact</p>
            <h2 className="text-3xl font-serif font-bold text-[#1C3A2F] mb-1">742 Districts</h2>
            <p className="text-sm font-medium text-[#2E5E45] bg-[#E8F4ED] inline-block px-2 py-1 rounded">Receiving Direct Funds</p>
         </div>
      </section>

      {/* What Does This Mean For You - Grid */}
      <section className="space-y-8">
         <div className="space-y-4 max-w-3xl">
            <h3 className="text-3xl font-serif font-bold text-[#1C3A2F]">What this means for you</h3>
            <p className="text-[#5b7a6b] text-lg font-medium leading-relaxed">
               The government isn't just spending numbers on a page. Every lakh crore is translated into immediate public infrastructure, rural empowerment, and national defense.
            </p>
         </div>
            
         <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#F5F9F6] p-8 rounded-3xl border border-[#2E5E45]/5 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
               <HeartPulse className="w-10 h-10 text-[#E05252] mb-6" />
               <h4 className="font-bold text-[#1C3A2F] mb-3 text-xl">Better Healthcare</h4>
               <p className="text-[#5b7a6b] text-base">Building 15,000 new rural clinics to significantly cut travel time for emergency medical care.</p>
            </div>
            <div className="bg-[#F5F9F6] p-8 rounded-3xl border border-[#2E5E45]/5 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
               <GraduationCap className="w-10 h-10 text-[#F5A623] mb-6" />
               <h4 className="font-bold text-[#1C3A2F] mb-3 text-xl">Education First</h4>
               <p className="text-[#5b7a6b] text-base">Completely digitizing 50,000 government schools with high-speed internet and smart boards.</p>
            </div>
            <div className="bg-[#F5F9F6] p-8 rounded-3xl border border-[#2E5E45]/5 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
               <Building className="w-10 h-10 text-[#2E8B8B] mb-6" />
               <h4 className="font-bold text-[#1C3A2F] mb-3 text-xl">Roads & Transport</h4>
               <p className="text-[#5b7a6b] text-base">Connecting every single village over 500 population with all-weather paved roads.</p>
            </div>
            <div className="bg-[#F5F9F6] p-8 rounded-3xl border border-[#2E5E45]/5 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
               <Zap className="w-10 h-10 text-[#F5A623] mb-6" />
               <h4 className="font-bold text-[#1C3A2F] mb-3 text-xl">Green Energy</h4>
               <p className="text-[#5b7a6b] text-base">Subsidizing solar panel installations for over 1 crore rural households this year.</p>
            </div>
         </div>
      </section>

    </div>
  );
}
