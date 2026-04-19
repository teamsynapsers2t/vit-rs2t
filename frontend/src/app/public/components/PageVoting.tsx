"use client";

import React, { useState } from "react";
import { useBudget } from "../../gov-dashboard/context/BudgetContext";
import { ThumbsUp, AlertCircle, MapPin, Search } from "lucide-react";
import { Problem } from "../../gov-dashboard/components/types";
import { motion, AnimatePresence } from "framer-motion";

export default function PageVoting() {
  const { problems, citizenVotes, toggleVote, isGovernmentFinalized } = useBudget();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all"|"trending"|"responded">("all");

  let filteredProblems = problems.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.state.toLowerCase().includes(search.toLowerCase()));
  if (filter === "trending") filteredProblems = filteredProblems.filter(p => p.trending);
  if (filter === "responded") filteredProblems = filteredProblems.filter(p => p.governmentResponded);

  filteredProblems.sort((a, b) => b.votes - a.votes);

  const handleVote = (pId: string) => {
    toggleVote(pId);
  };

  return (
    <div className="w-full h-full p-4 md:p-8 lg:px-12 max-w-7xl mx-auto space-y-8 pb-24">
      
      <div className="bg-[#1C3A2F] rounded-[2rem] p-8 md:p-12 text-white shadow-lg relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-[#F5A623] rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3"></div>
         <div className="relative z-10 max-w-2xl">
            <h2 className="text-4xl font-serif font-bold mb-4">Cast Your Votes. Influence the Budget.</h2>
            <p className="text-[#E8F4ED]/80 text-lg mb-8">
               Democracy doesn't sleep between elections. The government has identified 15 ultra-critical problems. Use your unlimited testing votes to force the Union Budget to increase funding for the issues you care about most.
            </p>
            
            <div className="flex flex-wrap gap-3">
               <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#4CAF7D] animate-ping"></div>
                  <span className="font-bold text-sm">Live Voting is Open</span>
               </div>
            </div>
         </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
         <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5b7a6b]" />
            <input 
              type="text"
              placeholder="Search by keyword or state..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-[#2E5E45]/20 rounded-xl focus:outline-none focus:border-[#4CAF7D] text-[#1C3A2F] font-medium shadow-sm"
            />
         </div>

         <div className="flex bg-[#F5F9F6] p-1.5 rounded-xl border border-[#2E5E45]/10 w-full md:w-auto overflow-x-auto shrink-0">
            <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${filter === "all" ? "bg-white text-[#1C3A2F] shadow-sm" : "text-[#5b7a6b]"}`}>All Issues</button>
            <button onClick={() => setFilter("trending")} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${filter === "trending" ? "bg-[#E05252]/10 text-[#E05252]" : "text-[#5b7a6b]"}`}>🔥 Trending</button>
            <button onClick={() => setFilter("responded")} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${filter === "responded" ? "bg-[#4CAF7D]/10 text-[#4CAF7D]" : "text-[#5b7a6b]"}`}>✅ Gov Responded</button>
         </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
         <AnimatePresence>
            {filteredProblems.map(p => {
               const hasVoted = citizenVotes.includes(p.id);
               const progressPct = Math.min(100, (p.currentFundingLCr / p.neededFundingLCr) * 100);
               
               return (
                 <motion.div 
                   key={p.id}
                   layout
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   transition={{ duration: 0.2 }}
                   className={`bg-white rounded-3xl p-6 border transition-all ${hasVoted ? "border-[#4CAF7D] shadow-[0_4px_20px_rgba(76,175,125,0.15)] ring-1 ring-[#4CAF7D]" : "border-[#2E5E45]/10 hover:shadow-md"}`}
                 >
                    <div className="flex justify-between items-start mb-4 gap-4">
                       <div>
                          <div className="flex flex-wrap gap-2 mb-3">
                             {p.trending && <span className="text-[10px] uppercase font-bold bg-[#E05252]/10 text-[#E05252] px-2 py-0.5 rounded">Trending</span>}
                             {p.governmentResponded && <span className="text-[10px] uppercase font-bold bg-[#4CAF7D]/10 text-[#4CAF7D] px-2 py-0.5 rounded">Gov Responded</span>}
                             <span className="text-[10px] uppercase font-bold bg-[#E8F4ED] text-[#2E8B8B] px-2 py-0.5 rounded flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.state}</span>
                          </div>
                          <h3 className="font-serif font-bold text-xl text-[#1C3A2F] leading-tight">{p.title}</h3>
                       </div>
                    </div>
                    
                    <p className="text-[#5b7a6b] text-sm mb-6 leading-relaxed">
                       {p.description}
                    </p>

                    <div className="bg-[#F5F9F6] rounded-xl p-4 mb-6">
                       <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                          <span className="text-[#2E5E45]">Gov Funding Level</span>
                          <span className={progressPct < 50 ? "text-[#E05252]" : "text-[#4CAF7D]"}>{progressPct.toFixed(0)}%</span>
                       </div>
                       <div className="w-full bg-[#E8F4ED] h-2 rounded-full overflow-hidden mb-2">
                          <div 
                            className={`h-full rounded-full ${progressPct < 50 ? "bg-[#E05252]" : "bg-[#4CAF7D]"}`} 
                            style={{ width: `${progressPct}%` }}
                          />
                       </div>
                       <div className="flex justify-between text-xs font-mono text-[#5b7a6b]">
                          <span>Current: ₹{p.currentFundingLCr.toFixed(2)} L Cr</span>
                          <span>Need: ₹{p.neededFundingLCr.toFixed(2)} L Cr</span>
                       </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                       <div className="text-sm font-bold text-[#1C3A2F] flex items-center gap-1.5">
                          <div className="flex -space-x-2 mr-2">
                            <div className="w-6 h-6 rounded-full bg-[#4CAF7D] border-2 border-white"></div>
                            <div className="w-6 h-6 rounded-full bg-[#1C3A2F] border-2 border-white"></div>
                            <div className="w-6 h-6 rounded-full bg-[#F5A623] border-2 border-white"></div>
                          </div>
                          {p.votes.toLocaleString()} Votes
                       </div>
                       
                       <button
                         onClick={() => handleVote(p.id)}
                         className={`px-6 py-2.5 rounded-full font-bold flex items-center gap-2 transition-all ${
                           hasVoted 
                             ? "bg-[#4CAF7D] text-[#1C3A2F]" 
                             : "bg-[#1C3A2F] hover:bg-[#2E5E45] text-white"
                         }`}
                       >
                         <ThumbsUp className={`w-4 h-4 ${hasVoted ? "fill-[#1C3A2F]" : ""}`} />
                         {hasVoted ? "Voted" : "Upvote"}
                       </button>
                    </div>
                 </motion.div>
               );
            })}
         </AnimatePresence>
      </div>

    </div>
  );
}
