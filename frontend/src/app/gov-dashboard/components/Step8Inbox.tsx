"use client";

import React from "react";
import { useBudget } from "../context/BudgetContext";
import { MessageSquare, MapPin, CheckCircle2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Step8Inbox() {
  const { feedbackMessages, markFeedbackRead, deleteFeedbackMessage } = useBudget();

  return (
    <div className="space-y-8 pb-12 w-full max-w-5xl mx-auto">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#2E5E45]/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5A623] rounded-full mix-blend-multiply filter blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-6 h-6 text-[#F5A623]" />
            <h2 className="text-3xl font-serif font-bold text-[#1C3A2F]">Citizen Direct Inbox</h2>
          </div>
          <p className="text-[#5b7a6b] font-medium max-w-2xl">
            Live unmoderated feed from the citizen portal. Read qualitative feedback and specific concerns to gain a deeper understanding behind the voting metrics.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
         <div className="bg-[#1C3A2F] text-white p-6 rounded-2xl border border-[#2E5E45]/20 shadow-md">
            <h4 className="text-[#88D4B0] text-sm font-bold uppercase tracking-wider mb-2">Total Submissions</h4>
            <div className="flex items-end gap-3 mb-1">
               <p className="text-4xl font-mono font-bold">{feedbackMessages.length}</p>
               <span className="text-[#F5A623] font-bold pb-1 text-sm animate-pulse">Live Stream</span>
            </div>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-[#2E5E45]/10 shadow-sm flex items-center justify-between">
            <div>
               <h4 className="text-[#5b7a6b] text-sm font-bold uppercase tracking-wider mb-2">Under Consideration</h4>
               <p className="text-3xl font-mono font-bold text-[#1C3A2F]">{feedbackMessages.filter(m => m.read).length}</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-[#E8F4ED] flex items-center justify-center">
               <CheckCircle2 className="w-8 h-8 text-[#4CAF7D]" />
            </div>
         </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-[#1C3A2F] text-xl px-2">Recent Submissions</h3>
        
        {feedbackMessages.length === 0 ? (
          <div className="bg-white border border-[#2E5E45]/10 rounded-2xl p-12 shadow-sm text-center">
             <MessageSquare className="w-12 h-12 text-[#5b7a6b]/30 mx-auto mb-4" />
             <h4 className="text-lg font-bold text-[#1C3A2F] mb-2">Inbox is Empty</h4>
             <p className="text-[#5b7a6b]">Waiting for citizens to submit feedback from the public portal.</p>
          </div>
        ) : (
          <AnimatePresence>
            {feedbackMessages.map((msg, idx) => (
              <motion.div 
                key={msg.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`group bg-white border rounded-2xl p-6 shadow-sm transition-all block ${msg.read ? "border-[#2E5E45]/10 opacity-70" : "border-[#F5A623]/30 hover:shadow-md"}`}
              >
                <div className="flex flex-col md:flex-row gap-6 md:items-start">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                       {!msg.read && <span className="w-2 h-2 rounded-full bg-[#F5A623]"></span>}
                       <span className="text-[10px] font-bold uppercase tracking-wider bg-[#fff0f0] text-[#E05252] px-2 py-1 rounded">
                         {msg.sector}
                       </span>
                       <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F5F9F6] border border-[#2E5E45]/10 text-[#5b7a6b] px-2 py-1 rounded flex items-center gap-1">
                         <MapPin className="w-3 h-3" /> {msg.state}
                       </span>
                       <span className="text-xs text-[#5b7a6b] ml-auto">
                         {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                    <p className="text-[#1C3A2F] text-base leading-relaxed italic mb-4">
                      "{msg.message}"
                    </p>
                    <p className="text-[#5b7a6b] text-sm font-bold">— {msg.name}</p>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-3 md:border-l md:border-[#E8F4ED] md:pl-6 pt-4 md:pt-0 shrink-0 h-full">
                     <button
                       onClick={() => markFeedbackRead(msg.id)}
                       disabled={msg.read}
                       className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors w-full md:w-auto ${msg.read ? "bg-[#E8F4ED] text-[#2E8B8B] cursor-not-allowed" : "bg-[#1C3A2F] text-white hover:bg-[#2E5E45]"}`}
                     >
                        {msg.read ? "Marked as Read" : "Mark as Read"}
                     </button>
                     <button
                       onClick={() => deleteFeedbackMessage(msg.id)}
                       className="p-2 text-[#E05252] hover:bg-[#E05252]/10 rounded-lg transition-colors border border-transparent hover:border-[#E05252]/20"
                       title="Delete Message"
                     >
                        <Trash2 className="w-5 h-5" />
                     </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
