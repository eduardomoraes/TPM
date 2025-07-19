import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ROIChart from "@/components/dashboard/roi-chart";
import { TrendingUp, DollarSign, Target, BarChart3 } from "lucide-react";

export default function Analytics() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: kpis } = useQuery({
    queryKey: ["/api/dashboard/kpis"],
    enabled: isAuthenticated,
  });

  const { data: topPromotions } = useQuery({
    queryKey: ["/api/dashboard/top-promotions"],
    enabled: isAuthenticated,
  });

  const { data: salesData } = useQuery({
    queryKey: ["/api/sales-data"],
    enabled: isAuthenticated,
  });

  if (authLoading || (!isAuthenticated && authLoading)) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  // Calculate additional analytics metrics
  const totalIncrementalSales = salesData?.reduce((sum: number, sale: any) => 
    sum + (Number(sale.incrementalSales) || 0), 0) || 0;
  
  const avgROI = kpis?.averageROI || 0;
  const totalPromotionsAnalyzed = topPromotions?.length || 0;

  return (
    <div className="flex h-screen bg-neutral">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Analytics & ROI</h2>
              <p className="text-sm text-gray-600">Comprehensive promotion performance analysis and insights</p>
            </div>
          </div>

          {/* Analytics KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average ROI</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgROI.toFixed(0)}%</div>
                <p className="text-xs text-muted-foreground">
                  Across all promotions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Incremental Sales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalIncrementalSales.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Total generated
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trade Spend ROI</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {kpis?.tradeSpendYTD && totalIncrementalSales ? 
                    (totalIncrementalSales / kpis.tradeSpendYTD * 100).toFixed(0) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Revenue per dollar spent
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Promotions Analyzed</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPromotionsAnalyzed}</div>
                <p className="text-xs text-muted-foreground">
                  Performance tracked
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ROI Trend Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ROIChart />
            
            {/* Performance Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                      <h4 className="font-medium text-green-900">Top Performing Strategy</h4>
                    </div>
                    <p className="text-sm text-green-700">
                      BOGO promotions show highest ROI with an average return of 289%
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center mb-2">
                      <Target className="h-5 w-5 text-blue-600 mr-2" />
                      <h4 className="font-medium text-blue-900">Best Channel</h4>
                    </div>
                    <p className="text-sm text-blue-700">
                      Target and Walmart partnerships deliver consistent 15%+ sales lift
                    </p>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center mb-2">
                      <BarChart3 className="h-5 w-5 text-yellow-600 mr-2" />
                      <h4 className="font-medium text-yellow-900">Optimization Opportunity</h4>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Seasonal timing adjustments could improve ROI by an estimated 12%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Promotions Analysis */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Top Performing Promotions - Detailed Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {!topPromotions || topPromotions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No promotion performance data available</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Promotion</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Account</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Period</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Budget</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">ROI</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Sales Lift</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topPromotions.map((promotion: any) => {
                        const roi = promotion.roi || 0;
                        const salesLift = promotion.salesLift || 0;
                        
                        return (
                          <tr key={promotion.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-gray-900">{promotion.name}</td>
                            <td className="py-3 px-4 text-gray-600">{promotion.account?.name || 'N/A'}</td>
                            <td className="py-3 px-4 text-gray-600">
                              {new Date(promotion.startDate).toLocaleDateString()} - {new Date(promotion.endDate).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 font-medium text-gray-900">
                              ${Number(promotion.budget).toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-semibold text-green-600">+{roi.toFixed(0)}%</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-medium text-blue-600">+{salesLift.toFixed(0)} units</span>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={roi > 250 ? 'bg-green-100 text-green-800' : 
                                               roi > 200 ? 'bg-blue-100 text-blue-800' : 
                                               'bg-yellow-100 text-yellow-800'}>
                                {roi > 250 ? 'Excellent' : roi > 200 ? 'Good' : 'Average'}
                              </Badge>
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

          {/* Sales Data Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              {!salesData || salesData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No sales data available for analysis</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {salesData.reduce((sum: number, sale: any) => sum + (Number(sale.unitsLift) || 0), 0).toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-600">Total Units Lift</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      ${totalIncrementalSales.toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-600">Incremental Revenue</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {salesData.length}
                    </div>
                    <p className="text-sm text-gray-600">Data Points Analyzed</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
