import CitizenShell from "./components/CitizenShell";

export const metadata = {
  title: "Public Citizen Dashboard | OptiIndia",
  description: "Transparent view into the 2026-27 Union Budget for all Indian citizens. See where your taxes go.",
};

export default function PublicDashboardPage() {
  return (
    <main className="w-full min-h-screen bg-[#FDFDFD]">
      <CitizenShell />
    </main>
  );
}
