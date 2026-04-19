"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Download, ExternalLink, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useBudget } from "../context/BudgetContext";

export default function Step6Success() {
  const [showConfetti, setShowConfetti] = useState(false);
  const router = useRouter();
  const { totalAllocated, finalizeBudget, statesData } = useBudget();

  useEffect(() => {
    setShowConfetti(true);
    finalizeBudget();
  }, [finalizeBudget]);

  const handleDownloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    // CSV Headers
    csvContent += "State,Population (Cr),District,Sector,Final Allocated Budget (Lakh Crores)\n";

    // Loop through global state context and pull out every microscopic level detail
    Object.entries(statesData).forEach(([stateName, stateInfo]) => {
      const pop = stateInfo.populationCr;
      Object.entries(stateInfo.districts).forEach(([districtName, districtInfo]) => {
        Object.entries(districtInfo.sectors).forEach(([sectorName, sectorInfo]) => {
          const allocated = sectorInfo.userAllocated !== null ? sectorInfo.userAllocated : sectorInfo.aiSuggested;
          // Format with quotes to prevent comma injection issues
          csvContent += `"${stateName}","${pop}","${districtName}","${sectorName}","${allocated.toFixed(3)}"\n`;
        });
      });
    });

    // Create a virtual link to trigger the browser download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Connect_Master_Budget_Report_2026_27.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex items-center justify-center -mt-10 overflow-hidden relative">
       {/* Pseudo-confetti/abstract background effect */}
       {showConfetti && (
         <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 1 }}
           className="absolute inset-0 pointer-events-none overflow-hidden"
         >
           {[...Array(20)].map((_, i) => (
             <motion.div
               key={i}
               initial={{ top: "-10%", left: `${Math.random() * 100}%`, rotate: 0 }}
               animate={{ top: "110%", rotate: 360 }}
               transition={{ duration: Math.random() * 3 + 2, ease: "linear", repeat: Infinity, delay: Math.random() * 2 }}
               className="absolute w-2 h-6 bg-[#4CAF7D]/20 rounded-full"
             />
           ))}
         </motion.div>
       )}

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="bg-white rounded-3xl p-10 md:p-16 max-w-2xl w-full text-center border border-[#2E5E45]/10 shadow-2xl relative z-10"
      >
        <div className="w-24 h-24 bg-[#E8F4ED] rounded-full flex items-center justify-center mx-auto mb-8 relative">
           <motion.div 
             initial={{ scale: 0 }}
             animate={{ scale: 1 }}
             transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
             className="absolute inset-0 border-4 border-[#4CAF7D] rounded-full opacity-30 animate-ping"
           />
           <CheckCircle className="w-12 h-12 text-[#4CAF7D]" />
        </div>

        <h1 className="font-serif text-4xl text-[#1C3A2F] font-bold mb-4">
          Allocation Successful
        </h1>
        
        <p className="text-[#2E5E45] mb-8 leading-relaxed max-w-md mx-auto font-medium">
          The Union Budget 2026-27 allocation of <span className="font-bold text-[#1A2E24] font-mono">₹{totalAllocated.toFixed(2)} L Cr</span> has been cryptographically signed, submitted, and pushed to the Reserve Bank registry.
        </p>

        <div className="bg-[#F5F9F6] border border-[#2E5E45]/10 rounded-xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 text-left">
           <div>
             <p className="text-xs text-[#2E8B8B] font-bold uppercase mb-1">Transaction Hash</p>
             <p className="font-mono text-sm text-[#1C3A2F] break-all bg-white px-3 py-1.5 rounded border border-[#E8F4ED]">
               0x8f7d9a...2c4b1(MOF-2026)
             </p>
           </div>
           <div className="shrink-0 flex items-center gap-2 text-[#4CAF7D] font-bold text-sm bg-white px-3 py-1.5 rounded border border-[#E8F4ED]">
             <ShieldCheck className="w-4 h-4" /> Secured
           </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
           <button 
             onClick={handleDownloadCSV}
             className="w-full sm:w-auto bg-[#1C3A2F] hover:bg-[#2E5E45] text-white px-8 py-3.5 rounded-full font-bold flex items-center justify-center gap-2 transition-colors shadow-md"
           >
             <Download className="w-5 h-5" /> Download Master Report
           </button>
           <button 
             onClick={() => router.push('/public')}
             className="w-full sm:w-auto bg-white border border-[#2E5E45]/20 hover:bg-[#E8F4ED] text-[#1C3A2F] px-8 py-3.5 rounded-full font-bold flex items-center justify-center gap-2 transition-colors"
           >
             View Citizen Portal <ExternalLink className="w-4 h-4" />
           </button>
        </div>
      </motion.div>
    </div>
  );
}
