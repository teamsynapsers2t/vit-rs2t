"use client";

import React, { useState } from "react";
import { useBudget } from "../../gov-dashboard/context/BudgetContext";
import { SECTORS, STATES, StateType } from "../../gov-dashboard/components/types";
import { Search } from "lucide-react";



export default function PageExplorer() {
  const { statesData, totalBudget } = useBudget();
  const [view, setView] = useState<"national" | "sectors" | "states">("national");
  const [search, setSearch] = useState("");

  // Strictly sum up user allocations from bottom-up (Districts -> Sectors)
  let publicTotalAllocated = 0;
  
  const stateLevelData = STATES.map(st => {
    const s = statesData[st];
    let stateAlloc = 0;
    Object.values(s.districts).forEach(d => {
      Object.values(d.sectors).forEach(sec => {
        stateAlloc += sec.userAllocated !== null ? sec.userAllocated : 0;
      });
    });
    const finalStateAlloc = s.userAllocatedLCr !== null && s.userAllocatedLCr > 0 ? s.userAllocatedLCr : Number(stateAlloc.toFixed(2));
    
    publicTotalAllocated += finalStateAlloc;
    
    return {
      name: st,
      Allocation: finalStateAlloc,
      Suggested: s.aiSuggestedLCr
    };
  }).filter(s => s.Allocation > 0 || s.Suggested > 0).sort((a, b) => b.Allocation - a.Allocation);

  const sectorSums: Record<string, number> = {};
  const sectorSuggested: Record<string, number> = {};
  
  Object.values(statesData).forEach(s => {
    Object.values(s.districts).forEach(dist => {
      Object.entries(dist.sectors).forEach(([secName, secData]) => {
        const alloc = secData.userAllocated !== null ? secData.userAllocated : 0;
        const sugg = secData.aiSuggested;
        sectorSums[secName] = (sectorSums[secName] || 0) + alloc;
        sectorSuggested[secName] = (sectorSuggested[secName] || 0) + sugg;
      });
    });
  });

  const sectorData = SECTORS.map(sec => ({
    name: sec,
    Allocation: Number((sectorSums[sec] || 0).toFixed(2)),
    Suggested: Number((sectorSuggested[sec] || 0).toFixed(2))
  })).sort((a, b) => b.Allocation - a.Allocation);

  const filteredStates = stateLevelData.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  const filteredSectors = sectorData.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="w-full h-full p-4 md:p-8 lg:px-12 max-w-7xl mx-auto space-y-8 pb-24">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-serif font-bold text-[#1C3A2F] mb-4">Budget Explorer</h2>
          <p className="text-[#5b7a6b] font-medium text-lg max-w-2xl">
            Dive into the raw public data. Every rupee allocated by the government is publicly visible here. 
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#E8F4ED] p-1.5 rounded-2xl border border-[#2E5E45]/10 shrink-0">
           <button onClick={() => setView("national")} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${view === "national" ? "bg-white text-[#1C3A2F] shadow-sm" : "text-[#5b7a6b] hover:text-[#1C3A2F]"}`}>National Summary</button>
           <button onClick={() => setView("states")} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${view === "states" ? "bg-white text-[#1C3A2F] shadow-sm" : "text-[#5b7a6b] hover:text-[#1C3A2F]"}`}>States</button>
           <button onClick={() => setView("sectors")} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${view === "sectors" ? "bg-white text-[#1C3A2F] shadow-sm" : "text-[#5b7a6b] hover:text-[#1C3A2F]"}`}>Sectors</button>
        </div>
      </div>

      <div className="bg-white border border-[#2E5E45]/10 rounded-[2rem] p-6 text-[#1A2E24] shadow-sm min-h-[500px]">
        {view === "national" && (
           <div className="flex flex-col items-center justify-center h-full py-12">
             <div className="w-full max-w-4xl space-y-10">
               <div className="text-center">
                 <h3 className="font-serif text-3xl font-bold text-[#1C3A2F] mb-2">The Union Budget 2026-27</h3>
                 <p className="text-[#5b7a6b]">Total funds available for national development</p>
               </div>
               
               {/* Progress Bar */}
               <div className="bg-[#F5F9F6] p-8 rounded-3xl border border-[#2E5E45]/5 relative overflow-hidden">
                 <div className="flex justify-between items-end mb-4">
                   <div>
                     <p className="text-sm font-bold text-[#2E8B8B] uppercase tracking-wider mb-1">Allocated Funds</p>
                     <p className="text-3xl font-mono font-bold text-[#1C3A2F]">₹{publicTotalAllocated.toFixed(2)} L Cr</p>
                   </div>
                   <div className="text-right">
                     <p className="text-sm font-bold text-[#5b7a6b] uppercase tracking-wider mb-1">Total Cap</p>
                     <p className="text-xl font-mono font-bold text-[#5b7a6b]">₹{totalBudget.toFixed(2)} L Cr</p>
                   </div>
                 </div>

                 <div className="h-4 w-full bg-[#E8F4ED] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#4CAF7D] transition-all duration-1000 ease-out" 
                      style={{ width: `${Math.min(100, (publicTotalAllocated / totalBudget) * 100)}%` }}
                    />
                 </div>
                 <p className="mt-4 text-xs font-bold text-[#4CAF7D] bg-[#E8F4ED] inline-block px-3 py-1.5 rounded-full">
                    {((publicTotalAllocated / totalBudget) * 100).toFixed(1)}% of Budget Utilized
                 </p>
               </div>
              
             </div>
           </div>
        )}

        {(view === "states" || view === "sectors") && (
           <div className="h-full flex flex-col">
              <div className="mb-6">
                 <h3 className="text-2xl font-serif font-bold text-[#1C3A2F] mb-2">
                    {view === "states" ? "State-wise Funding Breakdown" : "Sector-wise Funding Breakdown"}
                 </h3>
                 <p className="text-[#5b7a6b]">Detailed comparison of the final government allocated funds versus the system's baseline AI suggestions.</p>
              </div>

              <div className="flex items-center gap-4 mb-8">
                 <div className="relative flex-1 max-w-sm">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5b7a6b]" />
                   <input 
                     type="text"
                     placeholder={view === "states" ? "Search states..." : "Search sectors..."}
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     className="w-full pl-11 pr-4 py-3 bg-[#F5F9F6] border border-[#2E5E45]/10 rounded-xl focus:outline-none focus:border-[#4CAF7D] text-[#1C3A2F] font-medium"
                   />
                 </div>
                 <div className="w-full h-px bg-[#2E5E45]/10 flex-1"></div>
              </div>

              <div className="flex-1 w-full overflow-y-auto space-y-4 pr-2" style={{ maxHeight: '600px' }}>
                 {(() => {
                    const data = view === "states" ? filteredStates : filteredSectors;
                    
                    if (data.length === 0) {
                      return <p className="text-center text-[#5b7a6b] py-8">No records found matching your search.</p>;
                    }

                    return data.map(item => {
                      const diff = item.Allocation - item.Suggested;
                      const diffText = diff > 0 ? `+₹${diff.toFixed(2)} L Cr` : diff < 0 ? `-₹${Math.abs(diff).toFixed(2)} L Cr` : "Exact Match";
                      const percentDiff = item.Suggested > 0 ? ((diff / item.Suggested) * 100).toFixed(1) : "0.0";
                      
                      return (
                        <div key={item.name} className="bg-[#F5F9F6] p-5 rounded-2xl border border-[#2E5E45]/5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md hover:border-[#2E5E45]/20 transition-all">
                          <div className="flex-1">
                             <p className="font-bold text-[#1C3A2F] text-xl mb-2">{item.name}</p>
                             <div className="flex flex-wrap gap-x-6 gap-y-2">
                               <div className="text-sm text-[#5b7a6b] flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-[#4CAF7D]"></div>
                                  Gov Final: <span className="font-mono font-bold text-[#1C3A2F]">₹{item.Allocation.toFixed(2)} L Cr</span>
                               </div>
                               <div className="text-sm text-[#5b7a6b] flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-[#2E3A4B]"></div>
                                  AI Baseline: <span className="font-mono font-bold text-[#1C3A2F]">₹{item.Suggested.toFixed(2)} L Cr</span>
                               </div>
                             </div>
                          </div>
                          
                          <div className="md:text-right bg-white p-3 rounded-xl border border-[#2E5E45]/10 shrink-0 min-w-[160px]">
                             <p className="text-xs font-bold text-[#5b7a6b] uppercase tracking-wider mb-1">Difference</p>
                             <p className={`font-mono font-bold text-lg ${diff > 0 ? 'text-[#4CAF7D]' : diff < 0 ? 'text-[#E05252]' : 'text-[#2E8B8B]'}`}>
                               {diffText} 
                               {diff !== 0 && <span className="text-sm ml-1 opacity-80">({percentDiff}%)</span>}
                             </p>
                          </div>
                        </div>
                      );
                    });
                 })()}
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
