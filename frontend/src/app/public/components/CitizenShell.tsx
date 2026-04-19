"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBudget } from "../../gov-dashboard/context/BudgetContext";
import { Bell, Search, User, Menu, X, Landmark, TrendingUp, AlertTriangle, MapPin, MessageCircle, Shield } from "lucide-react";
import Link from "next/link";

import PageOverview from "./PageOverview";
import PageExplorer from "./PageExplorer";
import PageVoting from "./PageVoting";
import PageMyState from "./PageMyState";
import PageSpeakUp from "./PageSpeakUp";

export default function CitizenShell() {
  const { totalAllocated, isGovernmentFinalized, lastSaved, problems } = useBudget();
  const [activeTab, setActiveTab] = useState<"overview" | "explorer" | "voting" | "mystate" | "speakup">("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const TABS = [
    { id: "overview", label: "Overview", icon: Landmark },
    { id: "explorer", label: "Budget Explorer", icon: TrendingUp },
    { id: "voting", label: "Problem Voting", icon: AlertTriangle },
    { id: "mystate", label: "My State", icon: MapPin },
    { id: "speakup", label: "Speak Up", icon: MessageCircle },
  ] as const;
  const [mounted, setMounted] = useState(false);

  const topIssues = [...problems].sort((a, b) => b.votes - a.votes).slice(0, 3);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-[#FDFDFD]" />;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FDFDFD] text-[#1A2E24]">
      {/* Zepto-Style Ticker Strip */}
      <div className="h-8 bg-[#1C3A2F] text-white overflow-hidden flex items-center">
        <div className="flex animate-loop-scroll shrink-0 whitespace-nowrap text-xs font-mono tracking-wider opacity-80">
          {[1,2,3,4,5].map(idx => (
            <div key={`a-${idx}`} className="flex shrink-0">
              <span className="mx-4">TOTAL UNION BUDGET 2026-27: ₹53.47 L CR</span>
              <span className="mx-4 text-[#4CAF7D]">|</span>
              <span className="mx-4">CURRENT GOVERNMENT ALLOCATION: ₹{totalAllocated.toFixed(2)} L CR</span>
              <span className="mx-4 text-[#4CAF7D]">|</span>
              {topIssues.map((issue, issueIdx) => (
                <React.Fragment key={issue.id}>
                  <span className="mx-4 text-[#F5A623]">TRENDING: {issue.title.toUpperCase()} ({issue.votes.toLocaleString()} VOTES)</span>
                  <span className="mx-4 text-[#4CAF7D]">|</span>
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
        {/* Block 2 (Clone) */}
        <div className="flex animate-loop-scroll shrink-0 whitespace-nowrap text-xs font-mono tracking-wider opacity-80" aria-hidden="true">
          {[1,2,3,4,5].map(idx => (
            <div key={`b-${idx}`} className="flex shrink-0">
              <span className="mx-4">TOTAL UNION BUDGET 2026-27: ₹53.47 L CR</span>
              <span className="mx-4 text-[#4CAF7D]">|</span>
              <span className="mx-4">CURRENT GOVERNMENT ALLOCATION: ₹{totalAllocated.toFixed(2)} L CR</span>
              <span className="mx-4 text-[#4CAF7D]">|</span>
              {topIssues.map((issue, issueIdx) => (
                <React.Fragment key={issue.id}>
                  <span className="mx-4 text-[#F5A623]">TRENDING: {issue.title.toUpperCase()} ({issue.votes.toLocaleString()} VOTES)</span>
                  <span className="mx-4 text-[#4CAF7D]">|</span>
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#2E5E45]/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab("overview")}>
            <div className="w-8 h-8 rounded-full bg-[#1C3A2F] flex items-center justify-center">
              <Landmark className="w-4 h-4 text-[#4CAF7D]" />
            </div>
            <h1 className="font-serif font-bold text-xl text-[#1C3A2F] hidden sm:block">Connect</h1>
          </div>

          {/* Desktop Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === tab.id 
                    ? "bg-[#E8F4ED] text-[#1C3A2F] shadow-sm" 
                    : "text-[#5b7a6b] hover:bg-[#F5F9F6] hover:text-[#1A2E24]"
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-[#4CAF7D]" : "opacity-60"}`} />
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 md:gap-5">
             <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#F5F9F6] border border-[#2E5E45]/10 rounded-full text-xs font-bold text-[#2E5E45]">
               {isGovernmentFinalized ? (
                 <><span className="w-2 h-2 rounded-full bg-[#4CAF7D] animate-pulse"></span> GOV FINALIZED</>
               ) : (
                 <><span className="w-2 h-2 rounded-full bg-[#F5A623] animate-pulse"></span> GOV DRAFTING</>
               )}
             </div>

             <Link href="/gov-dashboard" className="hidden lg:flex items-center gap-2 px-4 py-1.5 bg-[#1C3A2F] text-white border border-[#2E5E45]/20 rounded-full text-xs font-bold hover:bg-[#2E5E45] transition-colors shadow-sm ml-2">
               <Shield className="w-3.5 h-3.5" /> Switch to Gov
             </Link>

             <button className="relative text-[#1C3A2F] hover:bg-[#F5F9F6] p-2 rounded-full transition-colors">
               <Bell className="w-5 h-5" />
               <span className="absolute top-1 right-1 w-2 h-2 bg-[#E05252] rounded-full border border-white"></span>
             </button>
             
             <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center cursor-pointer overflow-hidden border-2 border-[#E8F4ED]">
                <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Priya&backgroundColor=e8f4ed" alt="Avatar" className="w-full h-full object-cover" />
             </div>

             {/* Mobile Menu Toggle */}
             <button className="md:hidden p-2 text-[#1C3A2F]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
             </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-[#2E5E45]/10 overflow-hidden"
          >
            <nav className="flex flex-col p-4 gap-2">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                  className={`px-4 py-3 rounded-xl text-left font-bold transition-all flex items-center gap-3 ${
                    activeTab === tab.id 
                      ? "bg-[#E8F4ED] text-[#1C3A2F]" 
                      : "text-[#5b7a6b]"
                  }`}
                >
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "text-[#4CAF7D]" : "opacity-60"}`} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Render */}
      <main className="flex-1 w-full relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full"
          >
            {activeTab === "overview" && <PageOverview onGoExplore={() => setActiveTab("explorer")} />}
            {activeTab === "explorer" && <PageExplorer />}
            {activeTab === "voting" && <PageVoting />}
            {activeTab === "mystate" && <PageMyState />}
            {activeTab === "speakup" && <PageSpeakUp />}
          </motion.div>
        </AnimatePresence>
      </main>
      
      {/* CSS for Seamless Ticker */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes loop-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
        .animate-loop-scroll {
          animation: loop-scroll 40s linear infinite;
        }
      `}} />
    </div>
  );
}
