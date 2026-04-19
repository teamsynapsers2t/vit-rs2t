"use client";

import React from "react";
import { useBudget } from "../../gov-dashboard/context/BudgetContext";
import { MapPin, ArrowUpRight, ShieldCheck, HeartPulse, GraduationCap, Building, TrendingUp } from "lucide-react";

export default function PageMyState() {
  const { statesData } = useBudget();
  
  // Hackathon demo profile lock
  const userState = "Maharashtra";
  const userDistrict = "Pune";
  
  const stateData = statesData[userState];
  if (!stateData) return null;

  const districtData = stateData.districts[userDistrict];
  const allocatedState = stateData.userAllocatedLCr !== null ? stateData.userAllocatedLCr : stateData.aiSuggestedLCr;

  const sectorSums: { name: string; value: number; isAi: boolean }[] = [];
  Object.entries(districtData.sectors).forEach(([secName, secData]) => {
     sectorSums.push({
        name: secName,
        value: secData.userAllocated !== null ? secData.userAllocated : secData.aiSuggested,
        isAi: secData.userAllocated === null
     });
  });
  
  sectorSums.sort((a,b) => b.value - a.value);
  const topSectors = sectorSums.slice(0, 4);
  const COLORS = ["#1C3A2F", "#2E5E45", "#4CAF7D", "#2E8B8B"];

  const isPending = topSectors.every(sec => sec.value === 0);
  const pieData = isPending ? [{ name: "Allocations Pending", value: 1 }] : topSectors;

  return (
    <div className="w-full h-full p-4 md:p-8 lg:px-12 max-w-7xl mx-auto space-y-8 pb-24">
      
      <div className="flex flex-col md:flex-row items-center gap-6 justify-between bg-[#F5F9F6] border border-[#2E5E45]/10 rounded-[2rem] p-8">
         <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#E8F4ED] shrink-0">
               <MapPin className="w-8 h-8 text-[#4CAF7D]" />
            </div>
            <div>
               <h2 className="text-3xl font-serif font-bold text-[#1C3A2F] mb-1">Your Local Impact</h2>
               <p className="text-[#5b7a6b] font-medium text-lg flex items-center gap-2">
                 {userDistrict}, {userState} <ShieldCheck className="w-4 h-4 text-[#4CAF7D]" />
               </p>
            </div>
         </div>
         <button className="text-sm font-bold text-[#2E8B8B] underline decoration-[#2E8B8B]/30 hover:decoration-[#2E8B8B] underline-offset-4">
           Change Location
         </button>
      </div>

      <div className="space-y-8">
         <div className="bg-[#1C3A2F] text-white rounded-[2rem] p-8 md:p-10 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#4CAF7D] rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3"></div>
            
            <p className="text-[#4CAF7D] font-bold text-sm uppercase tracking-widest mb-3">State Allocation Budget</p>
            <h3 className="text-5xl font-mono font-bold mb-4">₹{allocatedState.toFixed(2)} <span className="text-2xl text-[#E8F4ED]/60 font-sans">L Cr</span></h3>
            <p className="text-[#E8F4ED]/80 text-lg max-w-md">
              This is the current budget projection for {userState}. Below, you can see how it directly impacts {userDistrict}.
              {stateData.userAllocatedLCr === null && <span className="block mt-2 text-[#F5A623] text-sm">(Showing AI Baseline - Awaiting Final Gov Approval)</span>}
            </p>
         </div>

         <h3 className="text-2xl font-serif font-bold text-[#1C3A2F] px-2">Top Programs in {userDistrict}</h3>
         <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topSectors.map((sec, i) => {
               const icons = [<Building />, <HeartPulse />, <GraduationCap />, <TrendingUp />];
               return (
                 <div key={sec.name} className="bg-white border border-[#2E5E45]/10 p-6 rounded-2xl hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden">
                    {sec.isAi && <div className="absolute top-0 right-0 bg-[#F5F9F6] text-[#5b7a6b] text-[10px] font-bold px-2 py-1 rounded-bl-lg">PROJECTION</div>}
                    <div className="w-10 h-10 rounded-xl bg-[#E8F4ED] text-[#2E5E45] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                       {React.cloneElement(icons[i % icons.length] as React.ReactElement<{className?: string}>, { className: "w-5 h-5" })}
                    </div>
                    <h4 className="font-bold text-[#1C3A2F] text-lg mb-1 truncate">{sec.name}</h4>
                    <p className="text-[#4CAF7D] font-mono font-bold">₹{sec.value.toFixed(2)} L Cr</p>
                 </div>
               );
            })}
         </div>
      </div>



    </div>
  );
}
