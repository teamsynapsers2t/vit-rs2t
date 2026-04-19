import React, { useMemo } from "react";
import { ThumbsUp, MessageSquare, AlertCircle, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { useBudget } from "../context/BudgetContext";

export default function Step7Feedback() {
  const { problems } = useBudget();
  
  const sortedProblems = useMemo(() => {
    return [...problems].sort((a,b) => b.votes - a.votes).slice(0, 10);
  }, [problems]);

  const totalVotes = useMemo(() => {
    return problems.reduce((sum, p) => sum + p.votes, 0);
  }, [problems]);

  return (
    <div className="space-y-8 pb-12 w-full max-w-5xl mx-auto">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#2E5E45]/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#4CAF7D] rounded-full mix-blend-multiply filter blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-6 h-6 text-[#4CAF7D]" />
            <h2 className="text-3xl font-serif font-bold text-[#1C3A2F]">Public Feedback & Voting</h2>
          </div>
          <p className="text-[#5b7a6b] font-medium max-w-2xl">
            Live insights from the citizen portal. See where the public is voting to prioritize national and state-level issues before finalizing allocations.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
         <div className="bg-[#1C3A2F] text-white p-6 rounded-2xl border border-[#2E5E45]/20 shadow-md">
            <h4 className="text-[#88D4B0] text-sm font-bold uppercase tracking-wider mb-2">Total Votes Cast</h4>
            <div className="flex items-end gap-3 mb-1">
               <p className="text-4xl font-mono font-bold">{totalVotes.toLocaleString()}</p>
               <span className="text-[#4CAF7D] font-bold pb-1 text-sm">Live</span>
            </div>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-[#2E5E45]/10 shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-5">
              <AlertCircle className="w-32 h-32" />
            </div>
            <h4 className="text-[#5b7a6b] text-sm font-bold uppercase tracking-wider mb-2">Top Requested Sector</h4>
            <div className="flex items-end gap-3 mb-1">
               <p className="text-3xl font-serif font-bold text-[#1C3A2F] truncate">{sortedProblems[0]?.category || "Healthcare"}</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-[#2E5E45]/10 shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-5">
              <BarChart3 className="w-32 h-32" />
            </div>
            <h4 className="text-[#5b7a6b] text-sm font-bold uppercase tracking-wider mb-2">Active Proposals</h4>
            <div className="flex items-end gap-3 mb-1">
               <p className="text-3xl font-mono font-bold text-[#1C3A2F]">{problems.length}</p>
            </div>
         </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-[#1C3A2F] text-xl px-2">Top Trending Citizen Proposals</h3>
        
        {sortedProblems.map((item, idx) => (
          <motion.div 
            key={item.id} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group bg-white border border-[#2E5E45]/10 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#4CAF7D]/30 transition-all block"
          >
            <div className="flex flex-col md:flex-row gap-6 md:items-center">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                   <span className="text-[10px] font-bold uppercase tracking-wider bg-[#E8F4ED] text-[#2E8B8B] px-2 py-1 rounded">
                     {item.category}
                   </span>
                   <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F5F9F6] border border-[#2E5E45]/10 text-[#5b7a6b] px-2 py-1 rounded">
                     {item.state}
                   </span>
                   {item.trending && (
                     <span className="text-[10px] font-bold uppercase tracking-wider bg-[#fff0f0] text-[#E05252] px-2 py-1 rounded flex items-center gap-1">
                       <span className="w-1.5 h-1.5 rounded-full bg-[#E05252] animate-pulse"></span> Trending
                     </span>
                   )}
                </div>
                <h3 className="text-xl font-bold text-[#1C3A2F] mb-2">{item.title}</h3>
                <p className="text-[#5b7a6b] text-sm md:text-base leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center gap-6 md:border-l md:border-[#E8F4ED] md:pl-6 pt-4 md:pt-0 shrink-0">
                <div className="text-center">
                   <div className="flex justify-center items-center gap-1.5 mb-1 text-[#4CAF7D]">
                     <ThumbsUp className="w-5 h-5 fill-current" />
                     <span className="font-mono font-bold text-lg">{item.votes.toLocaleString()}</span>
                   </div>
                   <p className="text-[10px] font-bold text-[#5b7a6b] uppercase">Upvotes</p>
                </div>
                <div className="w-px h-10 bg-[#E8F4ED]"></div>
                <div className="text-center">
                   <div className="flex justify-center items-center gap-1.5 mb-1 text-[#F5A623]">
                     <AlertCircle className="w-4 h-4 fill-current" />
                     <span className="font-mono font-bold">{item.impactScore}</span>
                   </div>
                   <p className="text-[10px] font-bold text-[#5b7a6b] uppercase">Impact Score</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="flex justify-center pt-4">
         <button className="text-[#2E8B8B] font-bold hover:underline hover:text-[#1C3A2F] transition-colors">
            View All {problems.length} Public Proposals →
         </button>
      </div>
    </div>
  );
}

