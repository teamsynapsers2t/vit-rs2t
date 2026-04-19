// All exactly matching the 11 sectors requested in the prompt
export const SECTORS = [
  "Agriculture & Allied Activities",
  "Rural Development",
  "Education",
  "Health & Family Welfare",
  "Infrastructure & Transport",
  "Energy & Power",
  "Defence & Internal Security",
  "Social Welfare (Women, Child, SC/ST)",
  "Urban Development",
  "Science, Technology & Environment",
  "Finance & Tax Administration"
] as const;

export type SectorType = typeof SECTORS[number];

// All 36 States as required
export const STATES = [
  "Andaman & Nicobar", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
  "Chandigarh", "Chhattisgarh", "Dadra & NH", "Delhi (NCT)", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jammu & Kashmir", "Jharkhand", "Karnataka", 
  "Kerala", "Ladakh", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", 
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", 
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
] as const;

export type StateType = typeof STATES[number];

// Real Maharashtra Districts
export const MAHARASHTRA_DISTRICTS = [
  "Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara",
  "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli",
  "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban",
  "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar",
  "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara",
  "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"
] as const;

// Types for State Data mapping in Context
export interface SectorAllocation {
  aiSuggested: number; // in L Cr for both state and district levels
  userAllocated: number | null; 
}

export interface DistrictData {
  districtName: string;
  population: number;
  sectors: Record<SectorType, SectorAllocation>;
  reviewed: boolean;
}

export interface StateData {
  stateName: StateType;
  populationCr: number;
  aiSuggestedLCr: number;
  userAllocatedLCr: number | null;
  reviewed: boolean;
  districts: Record<string, DistrictData>;
}

export interface Problem {
  id: string;
  title: string;
  category: SectorType;
  description: string;
  source: string;
  affected: string;
  currentFundingLCr: number;
  neededFundingLCr: number;
  votes: number;
  trending?: boolean;
  isNew?: boolean;
  governmentResponded?: boolean;
  impactScore: number;
  state: string; // The state it belongs to, used for filtering 
}

// Utility to generate deterministic pseudo-randoms based on strings to prevent massive hydration mismatches
export const quasiRandom = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = Math.imul(31, hash) + seed.charCodeAt(i) | 0;
  }
  return Math.abs(hash) / 2147483648;
};

export interface FeedbackMessage {
  id: string;
  name: string;
  state: string;
  sector: string;
  message: string;
  timestamp: string;
  read: boolean;
}
