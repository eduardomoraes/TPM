import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, Calendar, BarChart3 } from "lucide-react";

export default function Forecasting() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: promotions } = useQuery({
    queryKey: ["/api/promotions"],
    enabled: isAuthenticated,
  });

  if (authLoading || (!isAuthenticated && authLoading)) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  // Calculate forecast metrics from promotions data
  const totalForecastedVolume = promotions?.reduce((sum: number, promo: any) => 
    sum + (Number(promo.forecastedVolume) || 0), 0) || 0;
  
  const totalActualVolume = promotions?.reduce((sum: number, promo: any) => 
    sum + (Number(promo.actualVolume) || 0), 0) || 0;

  const forecastAccuracy = totalForecastedVolume > 0 ? 
    Math.round((totalActualVolume / totalForecastedVolume) * 100) : 0;

  const completedPromotions = promotions?.filter((promo: any) => promo.status === 'completed') || [];

  return (
    <div className="flex h-screen bg-neutral">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Forecasting & Analytics</h2>
              <p className="text-sm text-gray-600">AI-powered demand forecasting and volume predictions</p>
            </div>
          </div>

          {/* Forecast KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Forecast Accuracy</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{forecastAccuracy}%</div>
                <p className="text-xs text-muted-foreground">
                  Actual vs predicted volume
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Forecasted</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalForecastedVolume.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Units predicted
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Actual Volume</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalActualVolume.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Units sold
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Promotions Analyzed</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedPromotions.length}</div>
                <p className="text-xs text-muted-foreground">
                  Completed campaigns
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ML Forecasting Insights */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>ML Forecasting Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Key Forecasting Factors</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium">Historical Sales Data</span>
                      <Badge className="bg-blue-100 text-blue-800">High Impact</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium">Seasonal Trends</span>
                      <Badge className="bg-green-100 text-green-800">Medium Impact</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <span className="text-sm font-medium">Promotion Type</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Medium Impact</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium">Market Conditions</span>
                      <Badge className="bg-purple-100 text-purple-800">Low Impact</Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Model Performance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Volume Prediction Accuracy</span>
                      <span className="font-medium">{forecastAccuracy}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Revenue Forecast Accuracy</span>
                      <span className="font-medium">87%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">ROI Prediction Accuracy</span>
                      <span className="font-medium">84%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Model Confidence</span>
                      <span className="font-medium">91%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Promotion Forecast Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Promotion Forecast vs Actual Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {completedPromotions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No completed promotions available for analysis</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Promotion</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Account</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Forecasted Volume</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Actual Volume</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Accuracy</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Variance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedPromotions.map((promotion: any) => {
                        const forecasted = Number(promotion.forecastedVolume) || 0;
                        const actual = Number(promotion.actualVolume) || 0;
                        const accuracy = forecasted > 0 ? Math.round((actual / forecasted) * 100) : 0;
                        const variance = actual - forecasted;
                        
                        return (
                          <tr key={promotion.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-gray-900">{promotion.name}</td>
                            <td className="py-3 px-4 text-gray-600">{promotion.account?.name || 'N/A'}</td>
                            <td className="py-3 px-4 text-gray-600">{forecasted.toLocaleString()}</td>
                            <td className="py-3 px-4 text-gray-600">{actual.toLocaleString()}</td>
                            <td className="py-3 px-4">
                              <Badge className={accuracy >= 90 ? 'bg-green-100 text-green-800' : 
                                               accuracy >= 70 ? 'bg-yellow-100 text-yellow-800' : 
                                               'bg-red-100 text-red-800'}>
                                {accuracy}%
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <span className={variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {variance >= 0 ? '+' : ''}{variance.toLocaleString()}
                              </span>
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
    </div>
  );
}
