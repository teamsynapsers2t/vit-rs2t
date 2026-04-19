"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";

export default function Step0Login({ onLogin }: { onLogin: () => void }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1000);
  };

  return (
    <div className="absolute inset-0 bg-[#1C3A2F] flex flex-col items-center justify-center p-6 z-50 overflow-hidden font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white rounded-2xl p-10 shadow-2xl z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <h1 className="font-serif text-[42px] text-[#1C3A2F] font-bold tracking-tight text-center leading-none">
            Connect
          </h1>
          <h2 className="font-serif text-xl text-[#2E5E45] mt-6 font-bold text-center">
            Government Official Portal
          </h2>
          <p className="text-[#2E8B8B] text-center text-sm mt-3 leading-relaxed px-4">
            Secure access for authorized ministry and state government personnel only.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[#1A2E24] text-sm font-bold block">Ministry ID</label>
            <input 
              type="text" 
              placeholder="e.g. MOF-2026-XXXX"
              required
              className="w-full bg-[#E8F4ED] border border-[#2E5E45]/20 rounded-xl px-4 py-3.5 text-[#1A2E24] font-mono focus:outline-none focus:border-[#4CAF7D] focus:ring-2 focus:ring-[#4CAF7D]/20 transition-all font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[#1A2E24] text-sm font-bold block">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-[#E8F4ED] border border-[#2E5E45]/20 rounded-xl px-4 py-3.5 text-[#1A2E24] font-mono tracking-[0.25em] focus:outline-none focus:border-[#4CAF7D] focus:ring-2 focus:ring-[#4CAF7D]/20 transition-all"
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#4CAF7D] hover:scale-105 text-white font-bold rounded-full py-4 px-6 flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-70 disabled:hover:scale-100 group shadow-lg shadow-[#4CAF7D]/20"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Access Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center pt-2">
          <a href="#" className="text-sm font-medium text-[#2E8B8B] hover:text-[#1C3A2F] inline-flex items-center transition-colors">
            Are you a Citizen of India? <ArrowRight className="w-3 h-3 ml-1" /> Citizen Dashboard
          </a>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-[#E8F4ED]/60 text-xs flex items-center justify-center gap-3 font-mono font-medium tracking-wide"
      >
        <Lock className="w-3 h-3" />
        256-BIT ENCRYPTED | DATA: UNION BUDGET 2026-27 | MINISTRY OF FINANCE
      </motion.div>
    </div>
  );
}
