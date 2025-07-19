import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, PieChart } from "lucide-react";

export default function BudgetOverview() {
  const { isAuthenticated } = useAuth();

  const { data: quarterBudget } = useQuery({
    queryKey: ["/api/budgets/quarter", "Q3-2024"],
    enabled: isAuthenticated,
  });

  const { data: budgets } = useQuery({
    queryKey: ["/api/budgets"],
    enabled: isAuthenticated,
  });

  const utilizationPercentage = quarterBudget
    ? Math.round((quarterBudget.spent / quarterBudget.total) * 100)
    : 68;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Get top account allocations
  const topAccounts = budgets?.slice(0, 4) || [];

  const accountColors = [
    'bg-primary',
    'bg-secondary', 
    'bg-accent',
    'bg-gray-400'
  ];

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Budget Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Budget Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Q3 Budget Utilization</span>
              <span className="font-medium">{utilizationPercentage}%</span>
            </div>
            <Progress value={utilizationPercentage} className="h-3" />
            <div className="flex justify-between text-xs mt-1 text-gray-500">
              <span>
                {quarterBudget
                  ? formatCurrency(quarterBudget.spent)
                  : '$1.2M'} spent
              </span>
              <span>
                {quarterBudget
                  ? formatCurrency(quarterBudget.total)
                  : '$1.8M'} total
              </span>
            </div>
          </div>

          {/* Account Budget Breakdown */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Top Account Allocations</h4>
            <div className="space-y-3">
              {topAccounts.length > 0 ? (
                topAccounts.map((budget: any, index: number) => (
                  <div key={budget.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 ${accountColors[index]} rounded-full mr-3`}></div>
                      <span className="text-sm text-gray-700">
                        {budget.account?.name || 'Unknown Account'}
                      </span>
                    </div>
                    <span className="text-sm font-medium">
                      {formatCurrency(Number(budget.allocatedAmount))}
                    </span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-primary rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">Walmart</span>
                    </div>
                    <span className="text-sm font-medium">$420K</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-secondary rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">Target</span>
                    </div>
                    <span className="text-sm font-medium">$380K</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-accent rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">Kroger</span>
                    </div>
                    <span className="text-sm font-medium">$315K</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">Others</span>
                    </div>
                    <span className="text-sm font-medium">$185K</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Budget Actions */}
          <div className="pt-4 border-t border-gray-200">
            <Button className="w-full bg-primary text-white hover:bg-blue-700 mb-2">
              <Plus className="w-4 h-4 mr-2" />
              Allocate Budget
            </Button>
            <Button variant="outline" className="w-full text-primary border-primary hover:bg-blue-50">
              <PieChart className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
