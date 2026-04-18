"use client";

import { motion } from "framer-motion";
import { useAuth, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { 
  Users,
  Building2,
  Search,
  PieChart as PieChartIcon,
  History,
  MessageSquareHeart,
  CheckCircle2,
  Activity,
  ArrowRight,
  Shield,
  Landmark
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from "recharts";

// Animation Variants
const fadeInUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

// True Budget Data (50.65 Lakh Crore Total)
const budgetData = [
  { name: "Infrastructure/Capex", value: 11.50, color: "#f97316" }, // orange-500
  { name: "Defence", value: 6.81, color: "#14b8a6" },               // teal-500
  { name: "Agriculture", value: 1.63, color: "#84cc16" },           // lime-500
  { name: "Subsidies", value: 4.10, color: "#f43f5e" },             // rose-500
  { name: "Interest & Others", value: 26.61, color: "#cbd5e1" },    // slate-300
];

// Historical Audit Data
const historicalData = [
  { year: "23-24", Capex: 10.0, Welfare: 3.8 },
  { year: "24-25", Capex: 11.1, Welfare: 4.2 },
  { year: "25-26", Capex: 11.5, Welfare: 4.1 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.1)]">
        <p className="font-bold text-slate-900 mb-1">{payload[0].name}</p>
        <p className="text-xl font-black" style={{ color: payload[0].payload.color }}>
          ₹{payload[0].value}L Cr
        </p>
      </div>
    );
  }
  return null;
};

export default function Home() {
  const { isSignedIn } = useAuth();

  return (
    <main className="w-full bg-slate-50 min-h-screen text-slate-900 font-sans selection:bg-orange-500 selection:text-white overflow-hidden relative">
      
      {/* BACKGROUND GRADIENT MESH */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-orange-400/20 blur-[120px] mix-blend-multiply" />
        <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-teal-400/20 blur-[120px] mix-blend-multiply" />
        <div className="absolute -bottom-[10%] left-[20%] w-[60%] h-[60%] rounded-full bg-rose-400/15 blur-[120px] mix-blend-multiply" />
      </div>

      {/* NAVBAR */}
      <nav className="relative z-50 w-full pt-6 px-4 sm:px-6 lg:px-12">
         <div className="max-w-7xl mx-auto flex justify-between items-center bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-bold text-xl">
                 <Landmark className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">Connect</span>
            </div>
            <div className="hidden md:flex gap-6 text-sm font-semibold text-slate-600 items-center">
               <a href="#citizens" className="hover:text-orange-500 transition-colors">For Citizens</a>
               <a href="#government" className="hover:text-orange-500 transition-colors">For Government</a>
               <a href="#promises" className="hover:text-orange-500 transition-colors">Our Promise</a>
               <div className="h-4 w-px bg-slate-300 mx-2" />
               {!isSignedIn ? (
                 <>
                   <Link href="/sign-in" className="hover:text-orange-500 transition-colors font-bold">Sign In</Link>
                   <Link href="/sign-up" className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors font-bold">Sign Up</Link>
                 </>
               ) : (
                 <>
                   <Link href="/dashboard" className="text-orange-600 hover:text-orange-700 transition-colors font-bold">Dashboard &rarr;</Link>
                   <UserButton />
                 </>
               )}
            </div>
         </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-20 lg:pt-32 pb-24 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 lg:gap-12 items-center">
          
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7"
          >
            <motion.div variants={fadeInUp} className="inline-block mb-6 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white shadow-sm">
               <span className="text-orange-600 font-bold text-sm tracking-wide flex items-center gap-2">
                 India's Public Budget Optimizer 🇮🇳
               </span>
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
              Your Tax Money.<br />
              Your Nation.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">
                Fully Transparent.
              </span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg lg:text-xl text-slate-600 font-medium leading-relaxed max-w-2xl mb-6">
              See exactly how the Government of India’s <strong className="text-slate-900 bg-orange-100 px-2 py-0.5 rounded">₹50.65 lakh crore</strong> Union Budget 2025-26 is being allocated across sectors. <br/><br/>
              Real numbers from official documents and Open Budgets India. No hidden decisions. No jargon. Only clear insights for every Indian citizen.
            </motion.p>
            
            <motion.p variants={fadeInUp} className="text-md text-slate-500 italic mb-10 max-w-xl">
              "We use real data from the Union Budget and previous years’ records so every citizen can understand, track, and participate in how public funds are used for nation-building — from infrastructure and defence to health, education, and welfare."
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
              <Link href="/sign-up" className="flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white px-8 py-5 rounded-2xl font-bold text-lg shadow-[0_10px_40px_rgba(249,115,22,0.3)] hover:scale-[1.02] transition-transform w-full sm:w-auto ring-4 ring-orange-500/20">
                👥 I am a Citizen of India
              </Link>
              <Link href="/gov-sign-up" className="flex items-center justify-center gap-3 bg-white/80 backdrop-blur-md border-2 border-teal-600 text-teal-700 px-8 py-5 rounded-2xl font-bold text-lg shadow-lg hover:bg-teal-50 transition-colors w-full sm:w-auto">
                👮‍♂️ I am a Gov Official
              </Link>
            </motion.div>
          </motion.div>

          {/* Interactive Live Data Visualization */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="lg:col-span-5 relative"
          >
            <div className="bg-white/70 backdrop-blur-2xl border border-white p-8 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.06)] relative overflow-hidden flex flex-col items-center">
               
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-400/10 blur-2xl rounded-full pointer-events-none" />
               
               <div className="flex justify-between items-center w-full mb-2 relative z-10">
                 <div>
                   <h3 className="font-black text-2xl text-slate-900 tracking-tight">Major Heads</h3>
                   <p className="text-sm text-slate-500 font-medium">Union Budget 25-26 (₹50.65L Cr)</p>
                 </div>
                 <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold border border-emerald-100 flex items-center gap-1">
                   <Activity className="w-3 h-3" /> Live Data
                 </div>
               </div>

               {/* Recharts Pie Donut */}
               <div className="w-full h-[320px] relative z-10">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                     <Pie
                       data={budgetData}
                       cx="50%"
                       cy="50%"
                       innerRadius={80}
                       outerRadius={120}
                       paddingAngle={4}
                       dataKey="value"
                       stroke="none"
                     >
                       {budgetData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity duration-300" />
                       ))}
                     </Pie>
                   </PieChart>
                 </ResponsiveContainer>
                 {/* Center Total Output */}
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black text-slate-900 leading-none">₹50.65<span className="text-xl">L</span></span>
                    <span className="text-xs font-bold text-slate-400">CRORES</span>
                 </div>
               </div>

               <div className="w-full mt-4 flex flex-col gap-3 relative z-10 border-t border-slate-200/60 pt-6">
                 {budgetData.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm font-semibold">
                       <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                         <span className="text-slate-700">{item.name}</span>
                       </div>
                       <span className="text-slate-900 font-black">₹{item.value}L Cr</span>
                    </div>
                 ))}
                  <a href="#" className="text-orange-600 hover:text-orange-700 font-bold text-xs tracking-wide flex items-center justify-center gap-1 group mt-2 bg-orange-50 py-2 rounded-xl border border-orange-100">
                    Explore full breakdown in Citizen Dashboard <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </a>
               </div>

            </div>
          </motion.div>

        </div>
      </section>

      {/* 
        ========================================
        THE CORE PROBLEM WE SOLVE
        ========================================
      */}
      <section id="citizens" className="relative z-10 py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
            className="text-center mb-16 max-w-3xl mx-auto"
          >
            <span className="text-rose-600 font-bold text-sm tracking-widest uppercase bg-rose-50 px-4 py-1.5 rounded-full border border-rose-100">Why Connect Exists</span>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mt-6 mb-6 tracking-tight">
              The Public Budgeting System is Broken.
            </h2>
            <p className="text-xl text-slate-600 font-medium">
              We are structurally solving the four biggest systemic failures in how India's public money is planned and executed.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Crisis 1 */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
              className="bg-slate-50 p-8 rounded-3xl border border-slate-200 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-slate-300 group-hover:bg-orange-500 transition-colors" />
              <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                <span className="text-rose-500 font-black">01.</span> Politically Driven Decisions
              </h3>
              <p className="text-slate-600 font-medium mb-6">Currently, allocations are manipulated by political narratives rather than raw economic necessity or data.</p>
              
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative">
                <div className="absolute -top-3 -left-3 bg-orange-100 text-orange-600 px-3 py-1 rounded-lg text-xs font-bold border border-orange-200">The Connect Solution</div>
                <p className="text-slate-800 font-semibold text-[15px] pt-1">
                  We ingest raw demographic and infrastructural data to build algorithmic, unbiased budget models, transitioning governance from political to math-driven.
                </p>
              </div>
            </motion.div>

            {/* Crisis 2 */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
              className="bg-slate-50 p-8 rounded-3xl border border-slate-200 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-slate-300 group-hover:bg-blue-500 transition-colors" />
              <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                <span className="text-rose-500 font-black">02.</span> Zero Transparency
              </h3>
              <p className="text-slate-600 font-medium mb-6">Citizens have extremely low participation due to black-box budgeting and highly complex financial jargon.</p>
              
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative">
                <div className="absolute -top-3 -left-3 bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold border border-blue-200">The Connect Solution</div>
                <p className="text-slate-800 font-semibold text-[15px] pt-1">
                  A beautiful, plain-English citizen dashboard that breaks down exactly where every rupee of the ₹50.65L Cr flows, demanding total accountability.
                </p>
              </div>
            </motion.div>

            {/* Crisis 3 */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
              className="bg-slate-50 p-8 rounded-3xl border border-slate-200 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-slate-300 group-hover:bg-purple-500 transition-colors" />
              <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                <span className="text-rose-500 font-black">03.</span> Execution Failure
              </h3>
              <p className="text-slate-600 font-medium mb-6">Poor budget credibility where promised infrastructure wildly differs from actual execution and auditing.</p>
              
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative">
                <div className="absolute -top-3 -left-3 bg-purple-100 text-purple-600 px-3 py-1 rounded-lg text-xs font-bold border border-purple-200">The Connect Solution</div>
                <p className="text-slate-800 font-semibold text-[15px] pt-1">
                  We ruthlessly contrast longitudinal data (promises vs actual out-turns over 5 years) to flag repetitive execution failures before budgets are re-approved.
                </p>
              </div>
            </motion.div>

            {/* Crisis 4 */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
              className="bg-slate-50 p-8 rounded-3xl border border-slate-200 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-slate-300 group-hover:bg-emerald-500 transition-colors" />
              <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                <span className="text-rose-500 font-black">04.</span> No Feedback Loop
              </h3>
              <p className="text-slate-600 font-medium mb-6">The system is entirely top-down. The public has absolutely no mechanism to formally influence civic priorities.</p>
              
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative">
                <div className="absolute -top-3 -left-3 bg-emerald-100 text-emerald-600 px-3 py-1 rounded-lg text-xs font-bold border border-emerald-200">The Connect Solution</div>
                <p className="text-slate-800 font-semibold text-[15px] pt-1">
                  We provide a formalized Citizen Action portal allowing interactive weighting of priorities (Health, Capex), feeding a true democratic data loop directly back to policymakers.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* HIGHLIGHTS SECTION (4 Simple Cards with BarChart insertion) */}
      <section className="relative z-10 py-24 bg-white/50 backdrop-blur-sm border-y border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            
            {/* Standard Highlights */}
            {[
              {
                icon: <Search className="w-8 h-8" />,
                color: "bg-blue-100 text-blue-600",
                title: "Complete Transparency",
                desc: "View exact sector-wise allocations from the ₹50.65 lakh crore Union Budget 2025-26. Everything is open — no black box."
              },
              {
                icon: <Activity className="w-8 h-8" />,
                color: "bg-emerald-100 text-emerald-600",
                title: "Real & Reliable Data",
                desc: "All figures are sourced from the official Union Budget documents and Open Budgets India platform. We show both this year and previous years for honest comparison."
              },
              {
                icon: <MessageSquareHeart className="w-8 h-8" />,
                color: "bg-rose-100 text-rose-600",
                title: "Your Voice Can Shape Priorities",
                desc: "Use simple sliders to share what matters most to you (health, education, infrastructure, etc.) and see how citizen priorities could influence better allocations."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp}
                className="bg-white p-8 rounded-[24px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-100 hover:-translate-y-1 transition-transform duration-300"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 text-lg leading-relaxed font-medium">{feature.desc}</p>
              </motion.div>
            ))}

            {/* Interactive Bar Chart Highlight Card */}
            <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp}
                className="bg-white p-8 rounded-[24px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-100 hover:-translate-y-1 transition-transform duration-300 flex flex-col"
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-purple-100 text-purple-600">
                  <History className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Learning from the Past</h3>
                <p className="text-slate-600 text-[15px] leading-relaxed font-medium mb-6">
                  We compare current allocations with previous years’ actual spending so the same mistakes are not repeated and execution improves year after year.
                </p>
                <div className="flex-1 w-full min-h-[200px] h-full relative -ml-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={historicalData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B', fontWeight: 600 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                      <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', fontWeight: 'bold' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '10px' }} />
                      <Bar dataKey="Capex" fill="#f97316" radius={[4, 4, 0, 0]} barSize={20} />
                      <Bar dataKey="Welfare" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* 
        ========================================
        THE GOVERNMENT ENGINE SECTION
        ========================================
      */}
      <section id="government" className="relative z-10 py-32 bg-slate-900 border-y-[8px] border-teal-500">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#14b8a6 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
              <span className="text-teal-400 font-bold text-sm tracking-widest uppercase bg-teal-900/40 px-4 py-1.5 rounded-full border border-teal-700/50">For Policymakers</span>
              <h2 className="text-4xl lg:text-[52px] font-black text-white mt-6 mb-8 tracking-tight leading-[1.05]">
                The Smart<br/>Allocation Engine.
              </h2>
              <p className="text-lg text-slate-300 font-medium mb-8 leading-relaxed">
                Connect isn't just for citizens—it is a powerful AI assistant built specifically for government planners and the Ministry of Finance.
                <br/><br/>
                When officials draft a new budget, they can plug the numbers into our engine. The system analyzes years of past data to give instant, data-driven suggestions. It creates a <strong>Smart Allocation Guide</strong>—showing planners exactly where to move money to get the best results, avoid wasted funds, and ensure projects actually get completed.
              </p>
              
              <ul className="space-y-5 mb-10">
                <li className="flex items-center gap-4 text-slate-300 font-bold text-[17px]">
                  <div className="bg-teal-500/20 p-2 rounded-lg"><Activity className="text-teal-400 w-5 h-5 flex-shrink-0" /></div>
                  Predict the real-world success rate of new projects.
                </li>
                <li className="flex items-center gap-4 text-slate-300 font-bold text-[17px]">
                  <div className="bg-teal-500/20 p-2 rounded-lg"><Search className="text-teal-400 w-5 h-5 flex-shrink-0" /></div>
                  Automatically detect and flag budgets that lead to wasted funds.
                </li>
                <li className="flex items-center gap-4 text-slate-300 font-bold text-[17px]">
                  <div className="bg-teal-500/20 p-2 rounded-lg"><Users className="text-teal-400 w-5 h-5 flex-shrink-0" /></div>
                  Align government spending directly with what citizens want most.
                </li>
              </ul>
              
              <button className="bg-teal-500 hover:bg-teal-400 text-slate-900 px-8 py-4 rounded-xl font-black transition-all duration-300 shadow-[0_10px_40px_rgba(20,184,166,0.25)] flex items-center gap-2">
                Deploy The Government Engine <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>

            {/* A professional visual teaser for the Gov side */}
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
              <div className="relative bg-[#0f172a] rounded-[32px] p-8 lg:p-10 border border-slate-700 shadow-2xl overflow-hidden">
                
                {/* Glowing orb behind UI */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-500/20 blur-[80px] rounded-full pointer-events-none" />

                <div className="flex justify-between items-center mb-10 relative z-10">
                   <div className="text-white font-black text-xl tracking-tight">System Simulation Matrix</div>
                   <div className="bg-teal-500 border border-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.4)] text-slate-900 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                     <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-pulse" /> ENGINE ACTIVE
                   </div>
                </div>
                
                <div className="space-y-6 relative z-10">
                   {/* Suggestion 1 */}
                   <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 group hover:border-orange-500/50 transition-colors">
                     <div className="flex justify-between items-end mb-4">
                        <span className="text-white font-bold text-lg">Infrastructure (Capex)</span>
                        <span className="text-orange-400 font-black text-sm bg-orange-400/10 px-2 py-0.5 rounded">SUGGESTION: +1.8%</span>
                     </div>
                     <div className="w-full bg-slate-900 h-3 rounded-full flex gap-1 p-0.5 border border-slate-700">
                        <div className="bg-slate-500 h-full w-[60%] rounded-l-full" />
                        <div className="bg-gradient-to-r from-orange-400 to-orange-500 h-full w-[15%] rounded-r-full shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                     </div>
                     <p className="text-sm text-slate-400 mt-4 font-medium flex items-center gap-2">
                        <Activity className="w-4 h-4 text-orange-400" />
                        Our AI predicts that adding 1.8% here will <strong>double the success</strong> of new highways over 5 years.
                     </p>
                   </div>

                   {/* Suggestion 2 */}
                   <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 group hover:border-emerald-500/50 transition-colors">
                     <div className="flex justify-between items-end mb-4">
                        <span className="text-white font-bold text-lg">Welfare Subsidies</span>
                        <span className="text-emerald-400 font-black text-sm bg-emerald-400/10 px-2 py-0.5 rounded">SUGGESTION: -0.5%</span>
                     </div>
                     <div className="w-full bg-slate-900 h-3 rounded-full relative p-0.5 border border-slate-700 flex justify-between">
                        <div className="bg-slate-500 h-full w-[85%] rounded-full absolute left-0" />
                        <div className="bg-slate-900 h-full w-[10%] rounded-full absolute right-[10%] border-2 border-dashed border-emerald-500/50 z-10" />
                     </div>
                     <p className="text-sm text-slate-400 mt-4 font-medium flex items-center justify-end gap-2 text-right">
                        — Reducing wasted urban funds and moving them to villages that need them right now.
                        <Activity className="w-4 h-4 text-emerald-400" />
                     </p>
                   </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* STRONG PROMISE BOX SECTION */}
      <section id="promises" className="relative z-10 py-24 px-4 sm:px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/50 p-10 lg:p-16 rounded-[40px] border-2 border-emerald-200 shadow-[0_20px_60px_rgba(16,185,129,0.1)] relative overflow-hidden"
          >
            {/* Watermark icon */}
            <Shield className="absolute -bottom-10 -right-10 w-96 h-96 text-emerald-600/5 rotate-12 pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-3xl lg:text-5xl font-black text-emerald-950 mb-4 tracking-tight">Our Strong Promise</h2>
              <p className="text-xl text-emerald-800 font-semibold mb-10">To Every Indian Citizen:</p>

              <div className="space-y-6 mb-12">
                {[
                  "Full visibility into the ₹50.65 lakh crore Union Budget 2025-26",
                  "Simple, plain-language explanations of where your tax money is going",
                  "Honest year-over-year comparisons using real historical data",
                  "A tool that helps decision-makers move from political allocation to data-driven, high-impact spending",
                  "All data is public and verifiable — nothing is hidden or made up"
                ].map((promise, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="bg-emerald-500 rounded-full p-1 mt-1 shadow-sm">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-xl font-medium text-emerald-900 leading-snug">{promise}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-emerald-200/50 shadow-sm">
                <p className="text-lg lg:text-xl font-bold text-emerald-950 italic">
                  “Connect is built for you — the citizens of India — so public money delivers real value for every Indian, whether in villages, towns, or cities.”
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 bg-slate-900 pt-16 pb-8 px-4 sm:px-6 lg:px-12 border-t-[8px] border-orange-500">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg mb-8 text-white font-black text-3xl">
             <Landmark className="w-8 h-8" />
          </div>

          <h3 className="text-2xl font-bold text-white mb-6">Connect</h3>
          
          <div className="space-y-4 mb-12 max-w-2xl">
            <p className="text-slate-400 font-medium text-lg leading-relaxed">
              Data sourced from the <span className="text-white">Union Budget 2025-26 documents</span>, <span className="text-white">Open Budgets India</span> platform, and <span className="text-white">Ministry of Finance</span>.
            </p>
            <p className="text-slate-500 font-bold tracking-wide uppercase text-sm">
               Hackathon Prototype – April 2025
            </p>
          </div>

          <div className="w-full h-px bg-slate-800 mb-8" />

          <p className="text-orange-400 font-semibold text-sm flex items-center justify-center gap-2">
            Made with <span className="text-rose-500 text-lg">❤️</span> for a more transparent and accountable India
          </p>

        </div>
      </footer>

    </main>
  );
}
