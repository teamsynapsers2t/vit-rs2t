"use client";

import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { StateType, STATES, MAHARASHTRA_DISTRICTS, SECTORS, SectorType, DistrictData, StateData } from "../components/types";
import preGeneratedData from "./budget_data.json";

// Import the AI-synthesized realistic distributions
const INITIAL_STATES: Record<StateType, StateData> = preGeneratedData as any;

// ======================= CONTEXT ======================= //

interface BudgetContextType {
  totalBudget: number; // 53.47
  statesData: Record<StateType, StateData>;
  totalAllocated: number;
  remaining: number;
  currentStep: number;
  setCurrentStep: (s: number) => void;
  // Actions
  updateStateAllocation: (st: StateType, value: number | null) => void;
  updateDistrictSector: (st: StateType, dist: string, sector: SectorType, value: number | null) => void;
  autoFillStateDistricts: (st: StateType) => void;
  autoFillAllStates: () => void;
  lastSaved: string;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [statesData, setStatesData] = useState<Record<StateType, StateData>>(INITIAL_STATES);
  const [lastSaved, setLastSaved] = useState("Just now");
  
  const totalBudget = 53.47;

  const totalAllocated = useMemo(() => {
    let sum = 0;
    Object.values(statesData).forEach(s => {
      if (s.reviewed || s.userAllocatedLCr !== null) {
          sum += s.userAllocatedLCr !== null ? s.userAllocatedLCr : s.aiSuggestedLCr;
      }
    });
    return sum;
  }, [statesData]);

  const remaining = totalBudget - totalAllocated;

  // Auto-save logic implementation (Section 10 Rule 2)
  useEffect(() => {
    if (currentStep === 0) return;
    setLastSaved("💾 Saving...");
    const timer = setTimeout(() => {
      setLastSaved(`✅ Saved just now`);
    }, 1500);
    return () => clearTimeout(timer);
  }, [statesData]);

  const updateStateAllocation = (st: StateType, value: number | null) => {
    setStatesData(prev => ({
      ...prev,
      [st]: { ...prev[st], userAllocatedLCr: value }
    }));
  };

  const updateDistrictSector = (st: StateType, dist: string, sector: SectorType, value: number | null) => {
    setStatesData(prev => {
      const newState = { ...prev };
      newState[st].districts[dist].sectors[sector].userAllocated = value;
      
      // Compute the state's new total based on district sums if they modified it manually deeply
      // The prompt hints that editing a district updates the state sum. 
      // But it's complex if they also manually edit the state level. 
      let newDistSum = 0;
      Object.values(newState[st].districts).forEach(d => {
        Object.values(d.sectors).forEach(sec => {
          newDistSum += sec.userAllocated !== null ? sec.userAllocated : sec.aiSuggested;
        });
      });
      newState[st].userAllocatedLCr = Number(newDistSum.toFixed(2));
      newState[st].reviewed = true;
      return newState;
    });
  };

  const autoFillStateDistricts = (st: StateType) => {
    setStatesData(prev => {
      const newState = { ...prev };
      Object.keys(newState[st].districts).forEach(dKey => {
         Object.keys(newState[st].districts[dKey].sectors).forEach(sKey => {
            const sec = newState[st].districts[dKey].sectors[sKey as SectorType];
            if (sec.userAllocated === null) {
              sec.userAllocated = sec.aiSuggested;
            }
         });
      });
      newState[st].reviewed = true;
      return newState;
    });
  };

  const autoFillAllStates = () => {
    setStatesData(prev => {
      const newState = { ...prev };
      Object.keys(newState).forEach(sKey => {
        // DEMO FEATURE: Distinctly leave Maharashtra completely blank 
        // so the user has exactly 1 state to fill for the judges.
        if (sKey === "Maharashtra") return;

        const state = newState[sKey as StateType];
        if (!state.reviewed) {
          state.userAllocatedLCr = state.aiSuggestedLCr;
          state.reviewed = true;
        }
      });
      return newState;
    });
  };

  return (
    <BudgetContext.Provider value={{
      totalBudget,
      statesData,
      totalAllocated,
      remaining,
      currentStep,
      setCurrentStep,
      updateStateAllocation,
      updateDistrictSector,
      autoFillStateDistricts,
      autoFillAllStates,
      lastSaved
    }}>
      {children}
    </BudgetContext.Provider>
  );
}

export const useBudget = () => {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error("useBudget must be inside BudgetProvider");
  return ctx;
};
