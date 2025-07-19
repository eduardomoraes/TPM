import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Percent, Tag, TrendingUp } from "lucide-react";

export default function PromotionPerformance() {
  const { isAuthenticated } = useAuth();

  const { data: topPromotions, isLoading } = useQuery({
    queryKey: ["/api/dashboard/top-promotions"],
    enabled: isAuthenticated,
  });

  const getPromotionIcon = (type: string) => {
    switch (type) {
      case "bogo":
        return <Percent className="text-white" />;
      case "discount":
        return <Tag className="text-white" />;
      default:
        return <TrendingUp className="text-white" />;
    }
  };

  const getPromotionColor = (index: number) => {
    const colors = [
      "bg-secondary", // Green
      "bg-primary",   // Blue
      "bg-accent",    // Orange
    ];
    return colors[index % colors.length];
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Top Performing Promotions
          </CardTitle>
          <Button variant="link" className="text-primary text-sm hover:underline p-0">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                    <div className="ml-3">
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !topPromotions || topPromotions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No promotion performance data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topPromotions.slice(0, 3).map((promotion: any, index: number) => (
              <div
                key={promotion.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <div className={`w-10 h-10 ${getPromotionColor(index)} rounded-lg flex items-center justify-center`}>
                    {getPromotionIcon(promotion.promotionType)}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{promotion.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(promotion.startDate).toLocaleDateString()} - {new Date(promotion.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-secondary">
                    +{Math.round(promotion.roi || 0)}% ROI
                  </p>
                  <p className="text-sm text-gray-500">
                    +{Math.round(promotion.salesLift || 0)} Sales Lift
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
