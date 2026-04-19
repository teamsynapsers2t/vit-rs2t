"use client";

import React, { useState } from "react";
import { ArrowLeft, Check, ChevronDown, ChevronUp, Wand2, Info } from "lucide-react";
import { useBudget } from "../context/BudgetContext";
import { StateType, SectorType, SECTORS } from "./types";

export default function Step3StateDetail({ 
  stateName, 
  onBack,
  onAIInfo
}: { 
  stateName: StateType; 
  onBack: () => void;
  onAIInfo: (districtName: string, sectorName?: string) => void;
}) {
  const { statesData, updateDistrictSector, autoFillStateDistricts } = useBudget();
  const [expandedDistrict, setExpandedDistrict] = useState<string | null>(null);

  const stateData = statesData[stateName];
  if (!stateData) return null;

  const districts = Object.values(stateData.districts);

  const toggleExpand = (dName: string) => {
    setExpandedDistrict(prev => prev === dName ? null : dName);
  };

  const handleDeviationOverride = (distName: string, sector: SectorType, oldVal: number, rawInput: string) => {
    if(rawInput === "") {
        updateDistrictSector(stateName, distName, sector, null);
        return;
    }
    const val = parseFloat(rawInput);
    if(isNaN(val)) return;

    // Check deviation
    const deviation = Math.abs((val - oldVal) / oldVal) * 100;
    if(deviation > 25) {
      if(window.confirm(`Warning: >25% deviation from AI suggestion for ${sector} in ${distName}.\n\nAre you sure you want to proceed?`)) {
        updateDistrictSector(stateName, distName, sector, val);
      }
    } else {
      updateDistrictSector(stateName, distName, sector, val);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-12">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-[#2E5E45]/10">
        <div>
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 text-[#2E8B8B] hover:text-[#1C3A2F] text-sm font-bold mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to National Overview
          </button>
          <h2 className="font-serif text-[32px] text-[#1C3A2F] font-bold mb-2">{stateName} Allocation</h2>
          <p className="text-[#2E5E45] font-medium text-sm flex items-center gap-3">
             <span className="bg-[#E8F4ED] px-2 py-1 rounded text-[#2E8B8B] font-bold border border-[#2E5E45]/20">Population: {stateData.populationCr} Cr</span>
             <span className="bg-[#FFF9EC] px-2 py-1 rounded text-[#F5A623] font-bold border border-[#F5A623]/20">Target Budget: ₹{stateData.aiSuggestedLCr.toFixed(2)} L Cr</span>
          </p>
        </div>

        <button 
          onClick={() => autoFillStateDistricts(stateName)}
          className="bg-[#1C3A2F] hover:bg-[#2E5E45] text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-colors shadow-md"
        >
          <Wand2 className="w-5 h-5 text-[#4CAF7D]" />
          Auto-fill {stateName} with AI
        </button>
      </div>

      <p className="text-sm text-[#2E5E45] mb-6 font-medium">Select a region to expand sector-level allocations. Note: Values here are in Lakh Crores (L Cr).</p>

      {/* District Accordion List */}
      <div className="space-y-4">
        {districts.map(dist => {
           let distTotal = 0;
           let overridenCount = 0;
           Object.values(dist.sectors).forEach(sec => {
              distTotal += sec.userAllocated !== null ? sec.userAllocated : sec.aiSuggested;
              if (sec.userAllocated !== null && sec.userAllocated !== sec.aiSuggested) {
                 overridenCount++;
              }
           });

           const isExpanded = expandedDistrict === dist.districtName;

           return (
             <div key={dist.districtName} className="bg-white rounded-xl shadow-sm border border-[#2E5E45]/10 overflow-hidden">
               {/* Accordion Header */}
               <div 
                 onClick={() => toggleExpand(dist.districtName)}
                 className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#F5F9F6] transition-colors"
               >
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-[#E8F4ED] rounded-lg flex items-center justify-center border border-[#2E5E45]/20">
                     <span className="font-bold text-[#1C3A2F]">{dist.districtName.charAt(0)}</span>
                   </div>
                   <div>
                     <h4 className="font-bold text-[#1C3A2F] text-lg">{dist.districtName}</h4>
                     <p className="text-xs text-[#2E8B8B] font-mono">Pop: {(dist.population / 100000).toFixed(1)} Lakhs</p>
                   </div>
                 </div>

                 <div className="flex items-center gap-8">
                   {overridenCount > 0 && (
                     <span className="hidden md:flex text-xs font-bold text-[#F5A623] bg-[#FFF9EC] px-2 py-1 rounded-md items-center gap-1">
                       <Check className="w-3 h-3" /> {overridenCount} Overrides
                     </span>
                   )}
                   <div className="text-right">
                     <p className="text-xs text-[#2E5E45] font-bold uppercase mb-1">Total Allocated</p>
                     <p className="font-mono text-lg font-bold text-[#1C3A2F]">₹{distTotal.toFixed(6)} L Cr</p>
                   </div>
                   <div className="text-[#2E5E45]">
                     {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                   </div>
                 </div>
               </div>

               {/* Accordion Body: Sector Level */}
               {isExpanded && (
                 <div className="p-6 bg-[#F5F9F6] border-t border-[#2E5E45]/10">
                   <div className="mb-4 flex justify-between items-end border-b border-[#2E5E45]/10 pb-4">
                      <h5 className="font-serif font-bold text-[#1C3A2F] text-lg">Sector Allocations</h5>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onAIInfo(dist.districtName); }}
                        className="text-xs font-bold text-[#2E8B8B] underline flex items-center gap-1 hover:text-[#1C3A2F]"
                      >
                         <Info className="w-4 h-4" /> AI Strategic Overview for {dist.districtName}
                      </button>
                   </div>

                   <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[#2E5E45] border-b border-[#2E5E45]/10">
                          <th className="py-3 font-bold text-sm w-[40%]">Sector</th>
                          <th className="py-3 font-bold text-sm text-right w-[20%]">AI Suggested (L Cr)</th>
                          <th className="py-3 font-bold text-sm text-center w-[30%]">Manual Override (L Cr)</th>
                          <th className="py-3 font-bold text-sm text-center w-[10%]">Info</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8F4ED]">
                        {SECTORS.map(secName => {
                          const sec = dist.sectors[secName];
                          const isOverridden = sec.userAllocated !== null && sec.userAllocated !== sec.aiSuggested;

                          return (
                            <tr key={secName} className="hover:bg-white transition-colors group">
                              <td className="py-3 font-medium text-[#1A2E24] text-sm">{secName}</td>
                              <td className="py-3 font-mono font-bold text-[#2E8B8B] text-right">
                                ₹{sec.aiSuggested.toFixed(6)}
                              </td>
                              <td className="py-3 text-center">
                                <input 
                                  type="number"
                                  step="0.01"
                                  className={`w-28 px-2 py-1 text-right font-mono font-bold border rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF7D]/20 focus:border-[#4CAF7D] transition-colors text-sm ${isOverridden ? "bg-[#FFF9EC] border-[#F5A623]/40 text-[#1C3A2F]" : "bg-white border-[#2E5E45]/20 text-[#1C3A2F]"}`}
                                  placeholder="Value..."
                                  value={sec.userAllocated === null ? "" : sec.userAllocated}
                                  onChange={(e) => handleDeviationOverride(dist.districtName, secName, sec.aiSuggested, e.target.value)}
                                />
                              </td>
                              <td className="py-3 text-center">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); onAIInfo(dist.districtName, secName); }}
                                  className="p-1.5 text-[#2E5E45] hover:text-[#4CAF7D] hover:bg-[#E8F4ED] rounded-full transition-colors inline-block"
                                >
                                  <Info className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                   </table>
                 </div>
               )}
             </div>
           );
        })}
      </div>
    </div>
  );
}
