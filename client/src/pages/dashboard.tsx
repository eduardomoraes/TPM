import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import KPICards from "@/components/dashboard/kpi-cards";
import ROIChart from "@/components/dashboard/roi-chart";
import PromotionPerformance from "@/components/dashboard/promotion-performance";
import PromotionCalendarWidget from "@/components/dashboard/promotion-calendar-widget";
import BudgetOverview from "@/components/dashboard/budget-overview";
import RecentActivities from "@/components/dashboard/recent-activities";
import DeductionManagement from "@/components/dashboard/deduction-management";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-neutral">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-neutral">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {/* KPI Cards Section */}
          <KPICards />

          {/* Charts and Analytics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ROIChart />
            <PromotionPerformance />
          </div>

          {/* Promotion Calendar and Budget Overview */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            <div className="xl:col-span-2">
              <PromotionCalendarWidget />
            </div>
            <BudgetOverview />
          </div>

          {/* Recent Activities and Deduction Management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentActivities />
            <DeductionManagement />
          </div>
        </main>
      </div>
    </div>
  );
}
