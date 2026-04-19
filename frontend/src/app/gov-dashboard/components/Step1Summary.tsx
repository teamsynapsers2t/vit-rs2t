"use client";

import React from "react";
import { ArrowRight, FileText, CheckCircle2 } from "lucide-react";
import { useBudget } from "../context/BudgetContext";

export default function Step1Summary({ onNext }: { onNext: () => void }) {
  const { totalBudget } = useBudget();

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex flex-col gap-2 mb-10">
        <h2 className="font-serif text-4xl text-[#1C3A2F] font-bold">Executive Summary</h2>
        <p className="text-[#2E5E45] font-medium tracking-wide">CONFIDENTIAL • Ministry of Finance • Cycle 2026-27</p>
      </div>

      {/* 4 Big Numbers Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#2E5E45]/10">
          <p className="text-sm font-bold text-[#2E8B8B] uppercase mb-2">Total Union Budget</p>
          <p className="font-mono text-3xl font-bold text-[#1C3A2F]">₹{totalBudget.toFixed(2)} L Cr</p>
          <div className="mt-4 text-xs font-medium text-[#4CAF7D] bg-[#E8F4ED] inline-block px-2 py-1 rounded-md border border-[#4CAF7D]/20">
            +11% vs Prev Year
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#2E5E45]/10">
          <p className="text-sm font-bold text-[#2E8B8B] uppercase mb-2">AI-Driven CapEx</p>
          <p className="font-mono text-3xl font-bold text-[#1C3A2F]">₹13.52 L Cr</p>
          <div className="mt-4 text-xs font-medium text-[#4CAF7D] bg-[#E8F4ED] inline-block px-2 py-1 rounded-md border border-[#4CAF7D]/20">
            Target Match: 98%
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#2E5E45]/10">
          <p className="text-sm font-bold text-[#2E8B8B] uppercase mb-2">Sectors Optimized</p>
          <p className="font-mono text-3xl font-bold text-[#1C3A2F]">11</p>
          <div className="mt-4 text-xs font-medium text-[#2E8B8B] bg-[#E8F4ED] inline-block px-2 py-1 rounded-md border border-[#2E8B8B]/20">
            Across 36 States/UTs
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#2E5E45]/10">
          <p className="text-sm font-bold text-[#2E8B8B] uppercase mb-2">Fiscal Deficit Target</p>
          <p className="font-mono text-3xl font-bold text-[#1C3A2F]">4.3%</p>
          <div className="mt-4 text-xs font-medium text-[#4CAF7D] bg-[#E8F4ED] inline-block px-2 py-1 rounded-md border border-[#4CAF7D]/20">
            Within Safe Limits
          </div>
        </div>
      </div>

      {/* Narrative Section 2x2 */}
      <h3 className="font-serif text-2xl text-[#1C3A2F] font-bold mb-6">Strategic Imperatives</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="border border-[#2E5E45]/20 bg-white rounded-2xl p-8 hover:shadow-lg transition-shadow">
          <h4 className="font-serif text-[#1C3A2F] text-xl font-bold mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#4CAF7D]" />
            Data-Driven Empathy
          </h4>
          <p className="text-[#2E5E45] leading-relaxed text-sm">
             By fusing historic census data with real-time tax receipts and citizen feedback streams, the AI engine optimizes for maximum impact per Rupee. It specifically flags severe discrepancies in rural health infrastructure and agricultural distress zones.
          </p>
        </div>

        <div className="border border-[#2E5E45]/20 bg-white rounded-2xl p-8 hover:shadow-lg transition-shadow">
          <h4 className="font-serif text-[#1C3A2F] text-xl font-bold mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#4CAF7D]" />
            Human-in-the-Loop Override
          </h4>
          <p className="text-[#2E5E45] leading-relaxed text-sm">
             The engine provides mathematically optimal pathways, but local nuance requires human jurisdiction. You as the reviewing official hold full authority to override the AI's suggestions across any state or district, provided the master ₹53.47 Lakh Crore limit holds.
          </p>
        </div>
      </div>

      {/* Disclaimer bottom block */}
      <div className="bg-[#1C3A2F] rounded-2xl p-8 border border-[#2E5E45] text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex gap-4 items-start">
          <div className="w-12 h-12 bg-[#2E5E45] rounded-full flex flex-shrink-0 items-center justify-center">
            <FileText className="w-6 h-6 text-[#E8F4ED]" />
          </div>
          <div>
            <h4 className="font-bold text-lg mb-1">Begin Allocation Workflow</h4>
            <p className="text-sm text-[#E8F4ED]/80 font-medium leading-relaxed max-w-2xl">
              You are about to reviewing the auto-generated State-by-State allocations. Proceed to ensure 100% distribution across India.
            </p>
          </div>
        </div>

        <button 
          onClick={onNext}
          className="shrink-0 bg-[#4CAF7D] hover:scale-105 transition-transform text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-[#4CAF7D]/20 whitespace-nowrap"
        >
          Begin Allocation Process
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
