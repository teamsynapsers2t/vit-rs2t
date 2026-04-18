"use client";

import React, { useState } from "react";
import { ArrowRight, Search, ZoomIn, Info, Wand2, Calculator } from "lucide-react";
import { useBudget } from "../context/BudgetContext";
import { StateType, STATES } from "./types";

export default function Step2National({ 
  onNext, 
  onDrilldown, 
  onAIInfo 
}: { 
  onNext: () => void; 
  onDrilldown: (stateName: StateType) => void;
  onAIInfo: (stateName: StateType) => void;
}) {
  const { statesData, updateStateAllocation, autoFillAllStates, remaining } = useBudget();
  const [search, setSearch] = useState("");

  const filteredStates = STATES.filter(st => st.toLowerCase().includes(search.toLowerCase()));

  const handleDeviationOverride = (st: StateType, oldVal: number, rawInput: string) => {
    if(rawInput === "") {
      updateStateAllocation(st, null);
      return;
    }
    const val = parseFloat(rawInput);
    if(isNaN(val)) return;

    // Check deviation
    const deviation = Math.abs((val - oldVal) / oldVal) * 100;
    if(deviation > 25) {
      if(window.confirm(`Warning: You are deviating significantly (>25%) from the AI suggestion for ${st}.\n\nAI Suggestion: ₹${oldVal} L Cr\nYour Entry: ₹${val} L Cr\n\nAre you sure you want to proceed?`)) {
        updateStateAllocation(st, val);
      }
    } else {
      updateStateAllocation(st, val);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h2 className="font-serif text-[32px] text-[#1C3A2F] font-bold mb-2">National Budget Overview</h2>
          <p className="text-[#2E5E45] font-medium">Review and override AI allocations across all 36 States and Union Territories.</p>
        </div>
        
        {/* Fill Action */}
        <button 
          onClick={autoFillAllStates}
          className="bg-white hover:bg-[#E8F4ED] text-[#1C3A2F] border border-[#2E5E45]/20 px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Wand2 className="w-5 h-5 text-[#2E8B8B]" />
          Auto-fill everything with AI
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#2E5E45]/10 overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#2E5E45]/10 bg-[#F5F9F6] flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-5 h-5 text-[#2E5E45]/50 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search states..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#2E5E45]/20 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4CAF7D]/20 focus:border-[#4CAF7D] text-[#1A2E24]"
            />
          </div>
          <p className="text-[#2E5E45] text-xs font-bold font-mono">
            Values in ₹ Lakh Crore (L Cr)
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1C3A2F] text-white">
                <th className="py-4 px-6 text-sm font-bold w-[30%]">State / UT</th>
                <th className="py-4 px-6 text-sm font-bold text-right w-[15%]">Pop. (Cr)</th>
                <th className="py-4 px-6 text-sm font-bold text-right w-[20%]">AI Suggestion</th>
                <th className="py-4 px-6 text-sm font-bold text-center w-[20%]">Final Override</th>
                <th className="py-4 px-6 text-sm font-bold text-center w-[15%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8F4ED]">
              {filteredStates.map((st, idx) => {
                const data = statesData[st];
                const bgClass = idx % 2 === 0 ? "bg-white" : "bg-[#F5F9F6]";
                const isOverriden = data.userAllocatedLCr !== null && data.userAllocatedLCr !== data.aiSuggestedLCr;
                
                return (
                  <tr key={st} className={`${bgClass} hover:bg-[#E8F4ED]/50 transition-colors group`}>
                    <td className="py-4 px-6 font-bold text-[#1C3A2F]">{st}</td>
                    <td className="py-4 px-6 font-mono text-[#2E5E45] text-right">{data.populationCr}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 text-[#2E8B8B]">
                         <Calculator className="w-4 h-4 opacity-50" />
                         <span className="font-mono font-bold">₹{data.aiSuggestedLCr.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                       <div className="flex flex-col items-center justify-center">
                         <input 
                           type="number"
                           step="0.01"
                           className={`w-32 px-3 py-2 text-right font-mono font-bold border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF7D]/20 focus:border-[#4CAF7D] transition-colors ${isOverriden ? "bg-[#FFF9EC] border-[#F5A623]/40 text-[#1C3A2F]" : "bg-white border-[#2E5E45]/20 text-[#1C3A2F]"}`}
                           placeholder="Enter Value"
                           value={data.userAllocatedLCr === null ? "" : data.userAllocatedLCr}
                           onChange={(e) => handleDeviationOverride(st, data.aiSuggestedLCr, e.target.value)}
                         />
                         {isOverriden && <p className="text-[10px] text-[#F5A623] font-bold mt-1">Manually Overridden</p>}
                       </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                       <div className="flex items-center justify-center gap-2">
                         <button 
                           onClick={() => onAIInfo(st)}
                           className="p-2 bg-[#E8F4ED] text-[#2E8B8B] rounded-full hover:bg-[#2E5E45] hover:text-white transition-colors"
                           title="Read AI Rationale"
                         >
                           <Info className="w-4 h-4" />
                         </button>
                         <button 
                           onClick={() => onDrilldown(st)}
                           className="p-2 bg-[#1C3A2F] text-white rounded-full hover:bg-[#4CAF7D] transition-colors"
                           title="Drilldown to Districts"
                         >
                           <ZoomIn className="w-4 h-4" />
                         </button>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredStates.length === 0 && (
            <div className="text-center py-12 text-[#2E5E45] font-medium">
               No states found matching "{search}"
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button 
          onClick={onNext}
          disabled={Math.abs(remaining) > 0.05}
          className="bg-[#1C3A2F] hover:bg-[#2E5E45] text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed group whitespace-nowrap"
        >
          {Math.abs(remaining) > 0.05 ? "Fix Remaining Deficit to Proceed" : "Proceed to Final Review"}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </div>
  );
}
