import { useEffect, useState, createContext, useContext } from "react";
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

// Create a filter context for dashboard components
interface DashboardFilterContextType {
  searchQuery: string;
  dateRange: string;
  accountFilter: string;
  statusFilter: string;
}

export const DashboardFilterContext = createContext<DashboardFilterContextType>({
  searchQuery: "",
  dateRange: "all",
  accountFilter: "all",
  statusFilter: "all",
});

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [accountFilter, setAccountFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filterContextValue = {
    searchQuery,
    dateRange,
    accountFilter,
    statusFilter,
  };

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
    <DashboardFilterContext.Provider value={filterContextValue}>
      <div className="flex h-screen bg-neutral">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            accountFilter={accountFilter}
            onAccountFilterChange={setAccountFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
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
    </DashboardFilterContext.Provider>
  );
}
