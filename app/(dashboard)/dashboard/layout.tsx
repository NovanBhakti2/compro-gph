import { requireDashboardUser } from "@/lib/dal";
import { DashboardSidebar } from "@/components/organisms/dashboard/DashboardSidebar";

export const metadata = { title: "Dashboard | Gama Putra Harmoni" };

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireDashboardUser();

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-slate-800">
      <DashboardSidebar user={user} />
      <div className="lg:pl-64">
        <main className="mx-auto max-w-[1180px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
