"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, BrainCircuit, AlertTriangle, PlayCircle, BarChart3, ListFilter } from "lucide-react";
import { StateType, SECTORS } from "./types";

export default function AIInfoPage({ 
  stateName,
  districtName,
  sectorName,
  onBack
}: { 
  stateName: StateType;
  districtName: string | null;
  sectorName: string | null;
  onBack: () => void;
}) {
  const [data, setData] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated API call payload response
    const fetchAI = async () => {
       setLoading(true);
       try {
         // In a real integration, this queries Next.js API /api/analyze-state
         // We'll mock the stream effect
         setTimeout(() => {
            let markdownMock = "## Strategic AI Recommendations\n\n";
            markdownMock += `The OptiIndia allocation engine has reviewed historical spending, local population data, and key infrastructure needs for **${districtName || stateName}** over the last 5 years.\n\n`;
            
            if (sectorName) {
               markdownMock += `### Why ${sectorName} Needs Attention\n`;
               markdownMock += `1. **Historical Shortfall:** This sector hasn't received enough funding over the last 3 years. We recommend an 18-22% increase to catch up.\n`;
               markdownMock += `2. **High Economic Returns:** Every ₹1 Lakh Crore invested here generates roughly ₹2.4 Lakh Crore in local economic benefits within 3 years.\n`;
               markdownMock += `3. **Fair Bidding Warning:** Be careful with local contracts. Make sure the online bidding process is strictly monitored to prevent monopolies.\n`;
               markdownMock += `\n### Future Risk\nIf we don't fund this sector properly this year, the pending development work could double by the year 2030.\n`;
            } else {
               markdownMock += `### General Areas Needing Immediate Focus\n`;
               markdownMock += `* **Agriculture & Allied Activities:** Farmers face weather risks later this year. We strongly suggest investing in better irrigation to protect crops.\n`;
               markdownMock += `* **Infrastructure & Transport:** Important roads and bridges need repairs quickly before the monsoon season starts.\n`;
               markdownMock += `* **Health & Family Welfare:** Rural clinics are currently falling behind the national average. They urgently need more funding to buy equipment and hire staff.\n`;
            }

            setData(markdownMock);
            setLoading(false);
         }, 1200);
       } catch (e) {
         setLoading(false);
       }
    };
    fetchAI();
  }, [stateName, districtName, sectorName]);

  return (
    <div className="max-w-[1000px] mx-auto pb-12">
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-[#2E8B8B] hover:text-[#1C3A2F] text-sm font-bold mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Go Back
      </button>

      <div className="bg-[#1C3A2F] p-8 md:p-12 rounded-3xl text-white shadow-xl relative overflow-hidden mb-8">
         <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <BrainCircuit className="w-64 h-64" />
         </div>
         
         <div className="relative z-10">
            <div className="bg-[#4CAF7D]/20 border border-[#4CAF7D]/40 text-[#4CAF7D] text-xs font-mono font-bold px-3 py-1.5 rounded-md inline-flex items-center gap-2 mb-6">
               <span className="w-2 h-2 bg-[#4CAF7D] rounded-full animate-pulse"></span>
               OPTIC-ENGINE v4.2 INTELLIGENCE
            </div>

            <h2 className="font-serif text-4xl font-bold mb-4">
               {sectorName ? `Sector Analysis: ${sectorName}` : districtName ? `District Analysis: ${districtName}` : `State Analysis: ${stateName}`}
            </h2>
            
            <div className="flex flex-wrap gap-4 text-sm font-medium text-[#E8F4ED]/80">
               <span className="flex items-center gap-2 bg-[#1a3329] px-3 py-1.5 rounded-lg border border-[#2E5E45]"><ListFilter className="w-4 h-4" /> Scope: {stateName}</span>
               {districtName && <span className="flex items-center gap-2 bg-[#1a3329] px-3 py-1.5 rounded-lg border border-[#2E5E45]"><BarChart3 className="w-4 h-4" /> Dist: {districtName}</span>}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white rounded-3xl p-8 lg:p-12 border border-[#2E5E45]/10 shadow-sm min-h-[400px]">
           {loading ? (
             <div className="h-full flex flex-col items-center justify-center text-[#2E8B8B]">
                <div className="w-10 h-10 border-4 border-[#2E5E45]/20 border-t-[#4CAF7D] rounded-full animate-spin mb-4"></div>
                <p className="font-mono text-sm font-bold animate-pulse">Computing strategic dataset matrix...</p>
             </div>
           ) : (
             <div className="prose prose-green prose-h2:font-serif prose-h2:text-2xl prose-h2:text-[#1C3A2F] prose-h3:font-bold prose-h3:text-[#1C3A2F] prose-p:text-[#2E5E45] prose-li:text-[#2E5E45] max-w-none">
               {/* Simple Markdown Renderer Mock */}
               {data?.split('\n\n').map((para, i) => {
                 if (para.startsWith('## ')) return <h2 key={i} className="font-serif text-[28px] font-bold text-[#1C3A2F] mb-6 pb-4 border-b border-[#E8F4ED]">{para.replace('## ', '')}</h2>;
                 if (para.startsWith('### ')) return <h3 key={i} className="font-bold text-xl text-[#1C3A2F] mt-8 mb-4 flex items-center gap-2"><div className="w-2 h-2 bg-[#F5A623] rounded-full"></div>{para.replace('### ', '')}</h3>;
                 if (para.includes('* **') || para.includes('1. **') || para.includes('2. **') || para.includes('3. **')) {
                    return (
                      <div key={i} className="bg-[#F5F9F6] p-6 rounded-2xl border border-[#2E5E45]/10 my-6 text-[#2E5E45] text-[15px] leading-relaxed shadow-inner">
                         {para.split('\n').map((line, j) => <p key={j} className="mb-3 last:mb-0 flex items-start gap-2" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#1A2E24] font-bold">$1</strong>') }} />)}
                      </div>
                    );
                 }
                 return <p key={i} className="mb-6 text-[#2E5E45] leading-relaxed text-[15px]">{para}</p>;
               })}

               <div className="mt-8 pt-8 border-t border-[#E8F4ED]">
                  <div className="bg-[#FFF9EC] border border-[#F5A623]/30 rounded-2xl p-6">
                     <h4 className="font-bold text-[#F5A623] flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-5 h-5" /> 
                        Human-in-the-Loop Risk Protocol
                     </h4>
                     <p className="text-[#1A2E24] text-sm leading-relaxed font-medium">
                        Overriding AI suggestions by &gt;25% on CapEx requires justification logging in the final submission report. Ensure macro budgetary deviations align with local geopolitical necessities and documented mandates.
                     </p>
                  </div>
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
