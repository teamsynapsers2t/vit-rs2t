import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-orange-400/20 blur-[120px] mix-blend-multiply pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-teal-400/20 blur-[120px] mix-blend-multiply pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md p-4">
        <SignIn fallbackRedirectUrl="/public" appearance={{
          elements: {
            formButtonPrimary: "bg-teal-600 hover:bg-teal-700 text-white",
            card: "shadow-[0_20px_60px_rgba(0,0,0,0.06)] rounded-3xl border border-slate-100",
            headerTitle: "text-2xl font-black text-slate-900 tracking-tight",
            headerSubtitle: "text-slate-500 font-medium"
          }
        }} />
      </div>
    </div>
  );
}
