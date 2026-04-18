import DashboardShell from "./components/DashboardShell";

export const metadata = {
  title: "GovTech Dashboard | OptiIndia",
  description: "Official government budget allocation and analysis system.",
};

export default function GovDashboardPage() {
  return (
    <main className="w-full h-screen">
      <DashboardShell />
    </main>
  );
}
