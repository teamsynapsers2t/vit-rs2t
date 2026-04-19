"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Landmark, CheckCircle, Bell, Clock, Search, LogOut, ChevronRight, TrendingUp, MessageSquare, Users } from "lucide-react";
import Link from "next/link";
import { useBudget, BudgetProvider } from "../context/BudgetContext";
import { STATES, StateType } from "./types";

import Step0Login from "./Step0Login";
import Step1Summary from "./Step1Summary";
import Step2National from "./Step2National";
import Step3StateDetail from "./Step3StateDetail";
import Step5Final from "./Step5Final";
import Step6Success from "./Step6Success";
import Step7Feedback from "./Step7Feedback";
import Step8Inbox from "./Step8Inbox";
import AIInfoPage from "./AIInfoPage";

// The Shell consumes the Context
export default function DashboardShell() {
  const { 
    currentStep, setCurrentStep, totalBudget, totalAllocated, remaining, lastSaved 
  } = useBudget();

  const [activeState, setActiveState] = useState<StateType | null>(null);
  const [activeDistrict, setActiveDistrict] = useState<string | null>(null);
  const [activeSector, setActiveSector] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  // NATIVE BROWSER BACK ARROW SYNC
  React.useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const stepParam = params.get('step');
      if (stepParam) {
        const stepNum = parseInt(stepParam, 10);
        if (!isNaN(stepNum)) setCurrentStep(stepNum);
      } else {
        // If no step param, we are at the beginning (step 0 or 1)
        setCurrentStep(1);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setCurrentStep]);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('step') !== String(currentStep)) {
      window.history.pushState({ step: currentStep }, '', `?step=${currentStep}`);
    }
  }, [currentStep]);
  
  // Step 4 is AI Info in local routing logic (not in sidebar)
  // Sidebar steps:
  // 1: Executive Summary, 2: National Overview, 3: State Allocations, 4: District Allocations, 5: Final Comparison, 6: Submit

  if (!mounted) {
    return <div className="h-screen w-screen bg-[#E8F4ED]" />;
  }

  if (currentStep === 0) {
    return <Step0Login onLogin={() => setCurrentStep(1)} />;
  }

  const stepsList = [
    { num: 1, label: "Executive Summary", status: currentStep > 1 ? "Complete" : currentStep === 1 ? "In Progress" : "Locked" },
    { num: 2, label: "National Overview", status: currentStep > 2 && currentStep !== 7 && currentStep !== 8 ? "Complete" : currentStep === 2 ? "In Progress" : "Locked" },
    { num: 3, label: "State Allocations", status: currentStep > 3 && currentStep !== 7 && currentStep !== 8 ? "Complete" : currentStep === 3 ? "In Progress" : "Locked" },
    { num: 7, label: "Public Feedback Voting", status: currentStep === 7 ? "In Progress" : "Accessible" },
    { num: 8, label: "Citizen Inbox", status: currentStep === 8 ? "In Progress" : "Accessible" },
    { num: 5, label: "Final Comparison", status: currentStep > 5 && currentStep !== 7 && currentStep !== 8 ? "Complete" : currentStep === 5 ? "In Progress" : "Locked" },
    { num: 6, label: "Submit & Report", status: currentStep > 6 && currentStep !== 7 && currentStep !== 8 ? "Complete" : currentStep === 6 ? "In Progress" : "Locked" },
  ];

  const deficitAlert = remaining < 0;
  const amberAlert = remaining >= 0 && remaining < 2;

  // Render Breadcrumb dynamically
  const renderBreadcrumb = () => {
    if (currentStep < 3) return null;
    return (
      <div className="bg-[#E8F4ED] px-8 py-3 text-sm flex items-center gap-2 border-b border-[#2E5E45]/10 shrink-0">
        <button onClick={() => { setActiveState(null); setActiveDistrict(null); setCurrentStep(2); }} className="text-[#2E5E45] hover:text-[#1A2E24] hover:underline">National</button>
        {activeState && (
          <>
            <ChevronRight className="w-3 h-3 text-[#2E8B8B]" />
            <button onClick={() => { setActiveDistrict(null); setCurrentStep(3); }} className={`hover:underline ${!activeDistrict ? "font-bold text-[#4CAF7D]" : "text-[#2E5E45] hover:text-[#1A2E24]"}`}>
              {activeState}
            </button>
          </>
        )}
        {activeDistrict && (
          <>
            <ChevronRight className="w-3 h-3 text-[#2E8B8B]" />
            <button className={`hover:underline ${!activeSector ? "font-bold text-[#4CAF7D]" : "text-[#2E5E45] hover:text-[#1A2E24]"}`}>
              {activeDistrict}
            </button>
          </>
        )}
        {currentStep === 4 && activeSector && (
          <>
            <ChevronRight className="w-3 h-3 text-[#2E8B8B]" />
            <span className="text-[#2E5E45]">{activeSector}</span>
            <ChevronRight className="w-3 h-3 text-[#2E8B8B]" />
            <span className="font-bold text-[#4CAF7D]">AI Analysis</span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#E8F4ED] text-[#1A2E24] overflow-hidden font-sans">
      {/* Sidebar - Fix: 260px wide, #1C3A2F bg */}
      <aside className="w-[260px] bg-[#1C3A2F] text-[#F5F9F6] flex flex-col shrink-0 hidden md:flex z-20">
        <div className="p-6">
          <h1 className="font-serif font-bold text-2xl text-white tracking-wide">OptiIndia</h1>
          <p className="text-[10px] text-[#4CAF7D] uppercase tracking-widest mt-1 font-bold">Budget Optimizer 2026-27</p>
        </div>

        <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto overflow-x-hidden">
          <div className="flex flex-col gap-4">
            {stepsList.map(step => (
              <button 
                key={step.num}
                disabled={step.status === "Locked"}
                onClick={() => setCurrentStep(step.num)}
                className={`flex items-start gap-3 w-full text-left transition-all ${step.status === "Locked" ? "opacity-40 cursor-not-allowed" : "hover:scale-105"}`}
              >
                <div className="mt-0.5">
                   {step.status === "Complete" && <span className="text-xl">✅</span>}
                   {step.status === "In Progress" && <span className="text-xl">🔄</span>}
                   {step.status === "Locked" && <span className="text-xl opacity-50">🔒</span>}
                </div>
                <div>
                   <p className={`text-sm ${currentStep === step.num ? "text-white font-bold" : "text-[#F5F9F6]/80"}`}>{step.label}</p>
                   <p className="text-[10px] text-[#2E8B8B] uppercase font-bold">{step.status}</p>
                </div>
              </button>
            ))}
          </div>

          {currentStep > 1 && (
            <div className="mt-6 pt-6 border-t border-[#2E5E45]/30">
              <p className="text-xs text-[#2E8B8B] uppercase font-bold mb-3">Quick Jump to State:</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[#E8F4ED]/50" />
                <select 
                  className="w-full bg-[#2E5E45]/30 border border-[#2E5E45]/50 text-[#F5F9F6] text-xs py-2 pl-8 pr-3 rounded-lg focus:outline-none focus:border-[#4CAF7D] appearance-none cursor-pointer"
                  onChange={(e) => {
                    const st = e.target.value as StateType;
                    if(st) {
                       setActiveState(st);
                       setActiveDistrict(null);
                       setCurrentStep(3);
                    }
                  }}
                  value={activeState || ""}
                >
                  <option value="" disabled>Select State/UT...</option>
                  {STATES.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#2E5E45]/40 mt-auto bg-[#1a3329]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#E8F4ED] text-[#1C3A2F] flex items-center justify-center font-bold font-serif shadow-inner">
               RK
            </div>
            <div>
              <p className="font-bold text-sm text-white">Rajesh Kumar</p>
              <p className="text-xs text-[#4CAF7D]">Ministry of Finance</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="bg-[#4CAF7D]/20 text-[#4CAF7D] text-[10px] px-2 py-1 rounded-md font-bold uppercase flex items-center gap-1 border border-[#4CAF7D]/30">
              🔒 Secure Session
            </span>
            <button onClick={() => setCurrentStep(0)} className="text-xs text-[#E05252] hover:underline flex items-center gap-1 font-medium">
              <LogOut className="w-3 h-3" /> Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Header - #1C3A2F bg, full width */}
        <header className="h-[72px] bg-[#1C3A2F] shrink-0 px-6 flex items-center justify-between border-b border-[#2E5E45]/30 shadow-md z-10 w-full">
          <div className="flex items-center gap-8">
             <h2 className="text-lg font-sans text-white font-medium hidden lg:block">
               {currentStep === 1 && "Executive Summary"}
               {currentStep === 2 && "National Budget Overview"}
               {currentStep === 3 && "State & District Allocations"}
               {currentStep === 4 && "AI Analysis Deep Dive"}
               {currentStep === 5 && "Final Comparison"}
               {currentStep === 6 && "Submission Complete"}
               {currentStep === 7 && "Public Feedback Voting"}
               {currentStep === 8 && "Citizen Direct Inbox"}
             </h2>
             
             <Link href="/public" className="hidden lg:flex items-center gap-2 px-4 py-1.5 bg-white text-[#1C3A2F] border border-[#2E5E45]/20 rounded-full text-xs font-bold hover:bg-[#F5F9F6] transition-colors shadow-sm ml-2">
               <Users className="w-3.5 h-3.5" /> Switch to Citizen
             </Link>
             
             {/* LIVE BUDGET TRACKER */}
             {currentStep !== 6 && (
                <div className="flex items-center gap-1 bg-[#1a3329] p-1 rounded-xl border border-[#2E5E45]">
                  {/* Allocated Pill */}
                  <div className={`px-4 py-1.5 rounded-lg text-sm font-mono font-bold flex items-center gap-2 transition-colors ${
                    deficitAlert ? "bg-[#E05252] text-white animate-pulse shadow-[0_0_15px_rgba(224,82,82,0.5)]" :
                    amberAlert ? "bg-[#F5A623] text-[#1A2E24]" :
                    "bg-[#E8F4ED]/10 text-white"
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-current"></span>
                    Allocated: ₹{totalAllocated.toFixed(2)} L Cr
                  </div>
                  
                  {/* Remaining Pill */}
                  <div className={`px-4 py-1.5 rounded-lg text-sm font-mono font-bold flex items-center gap-2 border-l border-r border-[#2E5E45]/50 transition-colors ${
                    deficitAlert ? "text-[#E05252]" :
                    amberAlert ? "text-[#F5A623]" :
                    "text-[#4CAF7D]"
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-current"></span>
                    Remaining: ₹{Math.abs(remaining).toFixed(2)} L Cr
                  </div>

                  {/* Total Pill */}
                  <div className="px-4 py-1.5 rounded-lg text-sm font-mono font-bold flex items-center gap-2 text-white">
                    <span className="w-2 h-2 border border-white rounded-full"></span>
                    Total: ₹{totalBudget.toFixed(2)} L Cr
                  </div>
                </div>
             )}
          </div>

          <div className="flex items-center gap-6">
            <div className="text-xs font-mono text-[#F5F9F6]/60 flex items-center gap-2">
              {lastSaved}
            </div>
            <div className="relative">
              <div 
                className="cursor-pointer hover:bg-[#2E5E45]/40 p-2 rounded-full transition-colors"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                 <Bell className="w-5 h-5 text-white" />
                 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E05252] rounded-full border border-[#1C3A2F]"></span>
              </div>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-[#2E5E45]/10 overflow-hidden z-50">
                   <div className="bg-[#1C3A2F] text-white px-4 py-3 font-bold text-sm flex justify-between items-center">
                      Notifications
                      <span className="bg-[#E05252] text-xs px-2 py-0.5 rounded-full">2 New</span>
                   </div>
                   <div className="divide-y divide-[#2E5E45]/5 max-h-96 overflow-y-auto">
                       <div className="p-4 hover:bg-[#E8F4ED]/50 cursor-pointer transition-colors" onClick={() => { setShowNotifications(false); setCurrentStep(8); }}>
                         <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#F5A623]/10 flex items-center justify-center shrink-0 mt-1">
                               <MessageSquare className="w-4 h-4 text-[#F5A623]" />
                            </div>
                            <div>
                               <p className="text-sm font-bold text-[#1C3A2F] mb-1">New Citizen Message</p>
                               <p className="text-xs text-[#5b7a6b]">A citizen from Maharashtra has submitted direct feedback regarding Infrastructure. Click to read.</p>
                               <p className="text-[10px] text-[#2E8B8B] mt-2 font-bold uppercase">Just now</p>
                            </div>
                         </div>
                      </div>
                      <div className="p-4 hover:bg-[#E8F4ED]/50 cursor-pointer transition-colors" onClick={() => { setShowNotifications(false); setCurrentStep(7); }}>
                         <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#E05252]/10 flex items-center justify-center shrink-0 mt-1">
                               <TrendingUp className="w-4 h-4 text-[#E05252]" />
                            </div>
                            <div>
                               <p className="text-sm font-bold text-[#1C3A2F] mb-1">Feedback Alert: Healthcare</p>
                               <p className="text-xs text-[#5b7a6b]">Over 145,000 citizens have voted to increase funding for Rural Pune clinics. View public feedback.</p>
                               <p className="text-[10px] text-[#2E8B8B] mt-2 font-bold uppercase">10 mins ago</p>
                            </div>
                         </div>
                      </div>
                      <div className="p-4 hover:bg-[#E8F4ED]/50 cursor-pointer transition-colors" onClick={() => setShowNotifications(false)}>
                         <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#4CAF7D]/10 flex items-center justify-center shrink-0 mt-1">
                               <CheckCircle className="w-4 h-4 text-[#4CAF7D]" />
                            </div>
                            <div>
                               <p className="text-sm font-bold text-[#1C3A2F] mb-1">Budget Sanctioned</p>
                               <p className="text-xs text-[#5b7a6b]">Your allocation of ₹52.00 L Cr for Q3 has been officially sanctioned by the cabinet.</p>
                               <p className="text-[10px] text-[#2E8B8B] mt-2 font-bold uppercase">2 hours ago</p>
                            </div>
                         </div>
                      </div>
                   </div>
                   <div className="p-3 bg-[#F5F9F6] text-center border-t border-[#2E5E45]/5">
                      <button className="text-xs font-bold text-[#2E8B8B] hover:text-[#1C3A2F]" onClick={() => setShowNotifications(false)}>Mark all as read</button>
                   </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {renderBreadcrumb()}

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#E8F4ED]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="h-full"
            >
              {currentStep === 1 && <Step1Summary onNext={() => setCurrentStep(2)} />}
              {currentStep === 2 && 
                <Step2National 
                  onNext={() => setCurrentStep(5)} 
                  onDrilldown={(st) => { setActiveState(st); setCurrentStep(3); }} 
                  onAIInfo={(st) => { setActiveState(st); setCurrentStep(4); }}
                />
              }
              {currentStep === 3 && activeState && 
                <Step3StateDetail 
                  stateName={activeState} 
                  onBack={() => setCurrentStep(2)}
                  onAIInfo={(dist, sec) => { setActiveDistrict(dist); setActiveSector(sec || null); setCurrentStep(4); }}
                />
              }
              {currentStep === 4 && activeState &&
                <AIInfoPage 
                  stateName={activeState}
                  districtName={activeDistrict}
                  sectorName={activeSector}
                  onBack={() => setCurrentStep(activeDistrict ? 3 : 2)}
                />
              }
              {currentStep === 5 && 
                <Step5Final 
                  onNext={() => setCurrentStep(6)} 
                  onBack={() => setCurrentStep(2)} 
                  deficitAlert={deficitAlert}
                />
              }
              {currentStep === 6 && <Step6Success />}
              {currentStep === 7 && <Step7Feedback />}
              {currentStep === 8 && <Step8Inbox />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

