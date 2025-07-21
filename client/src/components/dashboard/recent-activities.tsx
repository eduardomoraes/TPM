import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useContext, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, Plus, TrendingUp } from "lucide-react";
import { DashboardFilterContext } from "@/pages/dashboard";

export default function RecentActivities() {
  const { isAuthenticated } = useAuth();
  const { searchQuery, dateRange, accountFilter, statusFilter } = useContext(DashboardFilterContext);

  const { data: activities, isLoading } = useQuery({
    queryKey: ["/api/dashboard/recent-activities"],
    enabled: isAuthenticated,
  });

  // Filter activities based on search and filters
  const filteredActivities = useMemo(() => {
    if (!activities) return [];
    
    return activities.filter((activity: any) => {
      // Search filter
      if (searchQuery && !activity.message.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Date range filter
      if (dateRange !== 'all') {
        const activityDate = new Date(activity.createdAt);
        const now = new Date();
        
        switch (dateRange) {
          case 'today':
            if (activityDate.toDateString() !== now.toDateString()) return false;
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (activityDate < weekAgo) return false;
            break;
          case 'month':
            if (activityDate.getMonth() !== now.getMonth() || activityDate.getFullYear() !== now.getFullYear()) return false;
            break;
          case 'quarter':
            const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
            if (activityDate < quarterStart) return false;
            break;
          case 'year':
            if (activityDate.getFullYear() !== now.getFullYear()) return false;
            break;
        }
      }
      
      return true;
    });
  }, [activities, searchQuery, dateRange, accountFilter, statusFilter]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'promotion_created':
        return <Plus className="text-white text-sm" />;
      case 'promotion_completed':
        return <CheckCircle className="text-white text-sm" />;
      case 'deduction_updated':
        return <AlertTriangle className="text-white text-sm" />;
      case 'forecast_updated':
        return <TrendingUp className="text-white text-sm" />;
      default:
        return <CheckCircle className="text-white text-sm" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'promotion_created':
        return 'bg-primary';
      case 'promotion_completed':
        return 'bg-secondary';
      case 'deduction_updated':
        return 'bg-accent';
      case 'forecast_updated':
        return 'bg-gray-400';
      default:
        return 'bg-secondary';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Recent Activities
          </CardTitle>
          <Button variant="link" className="text-primary text-sm hover:underline p-0">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start space-x-3 p-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !filteredActivities || filteredActivities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchQuery || dateRange !== 'all' ? 'No activities match your filters' : 'No recent activities'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity: any) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
              >
                <div className={`w-8 h-8 ${getActivityColor(activity.type)} rounded-full flex items-center justify-center flex-shrink-0`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimeAgo(activity.createdAt)}
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
