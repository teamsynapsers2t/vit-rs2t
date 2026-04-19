"use client";

import React, { useState } from "react";
import { useBudget } from "../../gov-dashboard/context/BudgetContext";
import { STATES, SECTORS } from "../../gov-dashboard/components/types";
import { MessageCircle, Send, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PageSpeakUp() {
  const { addFeedbackMessage } = useBudget();
  
  const [name, setName] = useState("");
  const [state, setState] = useState(STATES[0]);
  const [sector, setSector] = useState(SECTORS[0]);
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !name.trim()) return;

    addFeedbackMessage({
      name,
      state,
      sector,
      message,
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setMessage("");
      setName("");
    }, 3000);
  };

  return (
    <div className="w-full h-full p-4 md:p-8 lg:px-12 max-w-5xl mx-auto space-y-8 pb-24">
      
      <div className="bg-[#1C3A2F] rounded-[2rem] p-8 md:p-12 text-white shadow-lg relative overflow-hidden">
         <div className="absolute top-0 right-0 w-80 h-80 bg-[#4CAF7D] rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3"></div>
         <div className="relative z-10 max-w-2xl">
            <h2 className="text-4xl font-serif font-bold mb-4 flex items-center gap-3">
              <MessageCircle className="w-10 h-10 text-[#4CAF7D]" />
              Speak Up Directly
            </h2>
            <p className="text-[#E8F4ED]/80 text-lg mb-8">
               Have a specific concern or perspective on how your state's budget should be allocated? Write a direct message to the allocation algorithm and human reviewers.
            </p>
         </div>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-[#2E5E45]/10">
         <h3 className="text-2xl font-bold text-[#1C3A2F] mb-6">Submit Feedback</h3>
         
         <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-sm font-bold text-[#5b7a6b] uppercase tracking-wider">Your Name (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. concerned citizen"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-[#F5F9F6] border border-[#2E5E45]/10 rounded-xl focus:outline-none focus:border-[#4CAF7D] focus:ring-1 focus:ring-[#4CAF7D] text-[#1C3A2F] font-medium transition-all"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-bold text-[#5b7a6b] uppercase tracking-wider">State Context</label>
                  <select 
                    value={state}
                    onChange={(e) => setState(e.target.value as any)}
                    className="w-full px-4 py-3 bg-[#F5F9F6] border border-[#2E5E45]/10 rounded-xl focus:outline-none focus:border-[#4CAF7D] focus:ring-1 focus:ring-[#4CAF7D] text-[#1C3A2F] font-medium transition-all"
                  >
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-sm font-bold text-[#5b7a6b] uppercase tracking-wider">Related Sector</label>
               <select 
                  value={sector}
                  onChange={(e) => setSector(e.target.value as any)}
                  className="w-full px-4 py-3 bg-[#F5F9F6] border border-[#2E5E45]/10 rounded-xl focus:outline-none focus:border-[#4CAF7D] focus:ring-1 focus:ring-[#4CAF7D] text-[#1C3A2F] font-medium transition-all"
               >
                 {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
            </div>

            <div className="space-y-2">
               <label className="text-sm font-bold text-[#5b7a6b] uppercase tracking-wider">Your Message</label>
               <textarea 
                  rows={5}
                  placeholder="Tell us why this matters to you..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#F5F9F6] border border-[#2E5E45]/10 rounded-xl focus:outline-none focus:border-[#4CAF7D] focus:ring-1 focus:ring-[#4CAF7D] text-[#1C3A2F] font-medium resize-none transition-all"
               />
            </div>

            <AnimatePresence mode="wait">
               {isSubmitted ? (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-[#4CAF7D]/10 border border-[#4CAF7D] text-[#1C3A2F] px-6 py-4 rounded-xl flex items-center justify-center gap-2 font-bold"
                  >
                     <CheckCircle2 className="w-5 h-5 text-[#4CAF7D]" />
                     Message transmitted to the review board!
                  </motion.div>
               ) : (
                  <motion.button 
                    key="submit"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    type="submit"
                    disabled={!message.trim() || !name.trim()}
                    className="w-full md:w-auto px-8 py-4 bg-[#1C3A2F] text-white rounded-xl font-bold hover:bg-[#2E5E45] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
                  >
                     Submit Feedback <Send className="w-4 h-4" />
                  </motion.button>
               )}
            </AnimatePresence>
         </form>
      </div>
    </div>
  );
}
