import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 relative overflow-hidden">
      {/* Background gradients for Gov */}
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md p-4">
        <SignIn 
          fallbackRedirectUrl="/gov-dashboard"
          appearance={{
            elements: {
              formButtonPrimary: "bg-teal-500 hover:bg-teal-400 text-slate-900 border-none",
              card: "shadow-[0_20px_60px_rgba(0,0,0,0.3)] rounded-3xl border border-slate-700 bg-slate-800",
              headerTitle: "text-2xl font-black text-white tracking-tight",
              headerSubtitle: "text-slate-400 font-medium",
              socialButtonsBlockButtonText: "text-white",
              socialButtonsBlockButton: "border-slate-600 hover:bg-slate-700",
              dividerLine: "bg-slate-600",
              dividerText: "text-slate-400",
              formFieldLabel: "text-slate-300",
              formFieldInput: "bg-slate-900 border-slate-600 text-white",
              footerActionText: "text-slate-400",
              footerActionLink: "text-teal-400 hover:text-teal-300"
            }
          }} 
        />
      </div>
    </div>
  );
}
