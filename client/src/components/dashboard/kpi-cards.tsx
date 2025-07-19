import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Tag, Clock } from "lucide-react";

export default function KPICards() {
  const { isAuthenticated } = useAuth();

  const { data: kpis, isLoading } = useQuery({
    queryKey: ["/api/dashboard/kpis"],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Trade Spend YTD</p>
              <p className="text-3xl font-bold text-gray-900">
                {kpis ? formatCurrency(kpis.tradeSpendYTD) : '$0'}
              </p>
              <p className="text-sm text-secondary">
                <TrendingUp className="inline w-3 h-3 mr-1" />
                12% vs last year
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="text-primary text-xl" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average ROI</p>
              <p className="text-3xl font-bold text-gray-900">
                {kpis ? `${Math.round(kpis.averageROI)}%` : '0%'}
              </p>
              <p className="text-sm text-secondary">
                <TrendingUp className="inline w-3 h-3 mr-1" />
                8% improvement
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-secondary text-xl" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Promotions</p>
              <p className="text-3xl font-bold text-gray-900">
                {kpis ? kpis.activePromotions : 0}
              </p>
              <p className="text-sm text-gray-500">6 ending this week</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Tag className="text-accent text-xl" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Deductions Pending</p>
              <p className="text-3xl font-bold text-gray-900">
                {kpis ? formatCurrency(kpis.pendingDeductions) : '$0'}
              </p>
              <p className="text-sm text-error">
                <Clock className="inline w-3 h-3 mr-1" />
                14 days avg age
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Clock className="text-error text-xl" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
