import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { Landmark, FileText, Pickaxe, Settings, ShieldAlert, BadgeCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-orange-500 selection:text-white">
      {/* Navbar */}
      <nav className="w-full bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-bold">
               <Landmark className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">Connect Portal</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-slate-500 hidden sm:inline-block border border-slate-200 px-3 py-1 rounded-full">Secure Session</span>
            {/* UserButton handles the user dropdown and profile management automatically */}
            <UserButton appearance={{ elements: { avatarBox: "w-10 h-10 ring-2 ring-slate-100" } }} />
          </div>
        </div>
      </nav>

      {/* Dashboard Body */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight">Welcome to the Dashboard</h1>
            <BadgeCheck className="text-emerald-500 w-6 h-6" />
          </div>
          <p className="text-slate-500 font-medium text-lg">Your personalized data portal for public budget interaction.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Action Card 1 */}
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-200 hover:border-orange-500/50 transition-colors group cursor-pointer">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">My Voting Submissions</h3>
            <p className="text-slate-500 font-medium text-sm">Review the civic priorities you submitted for the upcoming local budget.</p>
          </div>

          {/* Action Card 2 */}
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-200 hover:border-teal-500/50 transition-colors group cursor-pointer">
            <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Pickaxe className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Track Local Projects</h3>
            <p className="text-slate-500 font-medium text-sm">See the real-time completion status of infrastructure projects in your zip code.</p>
          </div>

          {/* Action Card 3 */}
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-200 hover:border-rose-500/50 transition-colors group cursor-pointer">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Report Irregularities</h3>
            <p className="text-slate-500 font-medium text-sm">Securely file a report if a funded public project is abandoned or failing.</p>
          </div>
        </div>

      </main>
    </div>
  );
}
