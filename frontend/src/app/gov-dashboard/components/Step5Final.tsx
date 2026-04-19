"use client";

import React, { useState } from "react";
import { ArrowLeft, Send, CheckCircle2, AlertTriangle, TrendingUp, TrendingDown, Server } from "lucide-react";
import { useBudget } from "../context/BudgetContext";
import { STATES } from "./types";

export default function Step5Final({ 
  onNext, 
  onBack,
  deficitAlert
}: { 
  onNext: () => void; 
  onBack: () => void;
  deficitAlert: boolean;
}) {
  const { statesData, totalBudget, totalAllocated, remaining } = useBudget();
  const [submitting, setSubmitting] = useState(false);

  // Compute Macro Metrics
  let totalAISuggested = 0;
  let totalUserAllocated = 0;
  let totalOverrides = 0;

  Object.values(statesData).forEach(st => {
     totalAISuggested += st.aiSuggestedLCr;
     if (st.userAllocatedLCr !== null) {
        totalUserAllocated += st.userAllocatedLCr;
        if (st.userAllocatedLCr !== st.aiSuggestedLCr) {
           totalOverrides++;
        }
     } else {
        totalUserAllocated += st.aiSuggestedLCr; // implicit acceptance
     }
  });

  const deviationPercentage = ((totalUserAllocated - totalAISuggested) / totalAISuggested) * 100;

  const handleSubmit = async () => {
    if (deficitAlert) {
      alert("Cannot submit with a deficit. Please fix your allocations.");
      return;
    }
    setSubmitting(true);
    // Simulate API network request
    setTimeout(() => {
      setSubmitting(false);
      onNext();
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <button 
        onClick={onBack} 
        disabled={submitting}
        className="flex items-center gap-2 text-[#2E8B8B] hover:text-[#1C3A2F] text-sm font-bold mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Modifications
      </button>

      <div className="flex flex-col md:flex-row gap-8 mb-8">
         <div className="flex-1">
            <h2 className="font-serif text-[36px] text-[#1C3A2F] font-bold mb-2">Final Comparison Review</h2>
            <p className="text-[#2E5E45] font-medium leading-relaxed max-w-2xl">
               You are about to cryptographically sign and finalize the Union Budget allocation for {STATES.length} States and Territories. Please review the AI deviations below.
            </p>
         </div>

         {deficitAlert && (
           <div className="bg-[#FFF9EC] border-2 border-[#E05252] p-4 rounded-xl flex items-center gap-4 animate-pulse shrink-0">
              <AlertTriangle className="w-8 h-8 text-[#E05252]" />
              <div>
                 <p className="font-bold text-[#E05252]">Deficit Detected</p>
                 <p className="text-sm font-mono text-[#E05252]">Remaining: ₹{remaining.toFixed(2)} L Cr</p>
              </div>
           </div>
         )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
         <div className="bg-white rounded-2xl p-6 border border-[#2E5E45]/10 shadow-sm">
            <h4 className="text-xs font-bold text-[#2E8B8B] uppercase mb-1">Max Cap Allowed</h4>
            <p className="font-mono text-3xl font-bold text-[#1C3A2F]">₹{totalBudget.toFixed(2)}</p>
            <p className="text-[10px] text-[#2E5E45] mt-1">Lakh Crores Limit</p>
         </div>

         <div className="bg-white rounded-2xl p-6 border border-[#2E5E45]/10 shadow-sm relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 p-6 h-full ${remaining < 0 ? "bg-[#E05252]" : "bg-[#4CAF7D]"}`} />
            <h4 className="text-xs font-bold text-[#2E8B8B] uppercase mb-1 pl-4">Your Final Allocation</h4>
            <p className="font-mono text-3xl font-bold text-[#1C3A2F] pl-4">₹{totalAllocated.toFixed(2)}</p>
            <p className="text-[10px] text-[#2E5E45] mt-1 pl-4">Lakh Crores Allocated</p>
         </div>

         <div className="bg-white rounded-2xl p-6 border border-[#2E5E45]/10 shadow-sm">
            <h4 className="text-xs font-bold text-[#2E8B8B] uppercase mb-1">Net AI Deviation</h4>
            <p className="font-mono text-3xl font-bold text-[#1C3A2F] flex items-center gap-2">
               {Math.abs(deviationPercentage).toFixed(2)}%
               {deviationPercentage > 0 ? <TrendingUp className="w-6 h-6 text-[#E05252]" /> : deviationPercentage < 0 ? <TrendingDown className="w-6 h-6 text-[#2E8B8B]" /> : null}
            </p>
            <p className="text-[10px] text-[#2E5E45] mt-1">vs Initial Engine Proposal</p>
         </div>

         <div className="bg-white rounded-2xl p-6 border border-[#2E5E45]/10 shadow-sm">
            <h4 className="text-xs font-bold text-[#2E8B8B] uppercase mb-1">Manual Overrides</h4>
            <p className="font-mono text-3xl font-bold text-[#1C3A2F]">{totalOverrides}</p>
            <p className="text-[10px] text-[#2E5E45] mt-1">States Adjusted Manually</p>
         </div>
      </div>

      <div className="bg-[#1C3A2F] text-white p-8 md:p-12 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
         <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#4CAF7D] via-[#1C3A2F] to-[#1C3A2F]"></div>
         <Server className="absolute -left-10 -bottom-10 w-64 h-64 opacity-5" />
         
         <div className="relative z-10 flex-1">
            <h3 className="font-serif text-3xl font-bold mb-4 flex items-center gap-3">
               <CheckCircle2 className="w-8 h-8 text-[#4CAF7D]" />
               Ready for Execution
            </h3>
            <p className="text-[#E8F4ED]/80 leading-relaxed font-mono text-sm max-w-xl">
               By submitting, you authorize the provisioning of funds according to the modifications strictly outlined above. Any deviation tracking will be hashed and securely logged to the Blockchain registry under session MOF-2026.
            </p>
         </div>

         <div className="relative z-10 shrink-0 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm min-w-[300px]">
            <ul className="mb-6 space-y-3 font-mono text-xs text-[#E8F4ED]">
               <li className="flex justify-between border-b border-white/10 pb-2">
                 <span>Status Limit:</span>
                 <span className={deficitAlert ? "text-[#E05252] font-bold" : "text-[#4CAF7D] font-bold"}>
                   {deficitAlert ? "DEFICIT REACHED" : "GREEN - VERIFIED"}
                 </span>
               </li>
               <li className="flex justify-between border-b border-white/10 pb-2">
                 <span>Cryptographic Auth:</span>
                 <span>Valid Sign</span>
               </li>
               <li className="flex justify-between">
                 <span>Timestamp:</span>
                 <span>{new Date().toISOString().split('T')[0]}</span>
               </li>
            </ul>

            <button 
              onClick={handleSubmit} 
              disabled={submitting || deficitAlert}
              className={`w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg ${deficitAlert ? "bg-[#1a3329] text-white" : "bg-[#4CAF7D] hover:bg-[#2E5E45] text-white"}`}
            >
              {submitting ? (
                 <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Hashing & Submitting...
                 </div>
              ) : deficitAlert ? (
                 <>Fix Deficit</>
              ) : (
                 <>
                   <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                   Confirm & Finalize Budget
                 </>
              )}
            </button>
         </div>
      </div>
    </div>
  );
}
