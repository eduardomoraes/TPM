import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, Plus } from "lucide-react";
import BudgetAllocationDialog from "@/components/budgets/budget-allocation-dialog";
import type { BudgetAllocation, Account } from "@shared/schema";

export default function BudgetManagement() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedQuarter, setSelectedQuarter] = useState("Q3-2024");
  const [showAllocationDialog, setShowAllocationDialog] = useState(false);

  const { data: budgets, isLoading } = useQuery({
    queryKey: ["/api/budgets"],
    enabled: isAuthenticated,
  });

  const { data: quarterBudget } = useQuery({
    queryKey: ["/api/budgets/quarter", selectedQuarter],
    enabled: isAuthenticated,
  });

  if (authLoading || (!isAuthenticated && authLoading)) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const utilizationPercentage = quarterBudget ? 
    Math.round((quarterBudget.spent / quarterBudget.total) * 100) : 0;

  return (
    <div className="flex h-screen bg-neutral">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Budget Management</h2>
              <p className="text-sm text-gray-600">Track and manage promotional budgets across accounts</p>
            </div>
            <Button 
              className="bg-primary text-white hover:bg-blue-700"
              onClick={() => setShowAllocationDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Allocate Budget
            </Button>
          </div>

          {/* Quarter Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${quarterBudget?.total ? Number(quarterBudget.total).toLocaleString() : '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedQuarter} allocation
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Spent Amount</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${quarterBudget?.spent ? Number(quarterBudget.spent).toLocaleString() : '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {utilizationPercentage}% utilized
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Remaining</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${quarterBudget ? Number(quarterBudget.total - quarterBudget.spent).toLocaleString() : '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Available to spend
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Budget Utilization */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Budget Utilization - {selectedQuarter}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Budget utilization</span>
                  <span className="font-medium">{utilizationPercentage}%</span>
                </div>
                <Progress value={utilizationPercentage} className="h-3" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>
                    ${quarterBudget?.spent ? Number(quarterBudget.spent).toLocaleString() : '0'} spent
                  </span>
                  <span>
                    ${quarterBudget?.total ? Number(quarterBudget.total).toLocaleString() : '0'} total
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budget Allocations by Account */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Allocations by Account</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading budget allocations...</div>
              ) : budgets?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No budget allocations found</p>
                  <Button>Create first budget allocation</Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Account</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Quarter</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Allocated</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Spent</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Remaining</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Utilization</th>
                      </tr>
                    </thead>
                    <tbody>
                      {budgets?.map((budget: BudgetAllocation & { account: Account | null }) => {
                        const allocated = Number(budget.allocatedAmount);
                        const spent = Number(budget.spentAmount);
                        const remaining = allocated - spent;
                        const utilization = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
                        
                        return (
                          <tr key={budget.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-gray-900">
                              {budget.account?.name || 'Unknown Account'}
                            </td>
                            <td className="py-3 px-4 text-gray-600">{budget.quarter}</td>
                            <td className="py-3 px-4 font-medium text-gray-900">
                              ${allocated.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              ${spent.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              ${remaining.toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <Progress value={utilization} className="h-2 w-16" />
                                <span className="text-sm font-medium">{utilization}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
      
      <BudgetAllocationDialog
        isOpen={showAllocationDialog}
        onClose={() => setShowAllocationDialog(false)}
      />
    </div>
  );
}
