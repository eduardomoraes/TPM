import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useContext, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardFilterContext } from "@/pages/dashboard";

export default function PromotionCalendarWidget() {
  const { isAuthenticated } = useAuth();
  const { searchQuery, accountFilter, statusFilter } = useContext(DashboardFilterContext);

  const { data: upcomingPromotions, isLoading } = useQuery({
    queryKey: ["/api/promotions/upcoming"],
    enabled: isAuthenticated,
  });

  // Filter promotions based on search and filters
  const filteredPromotions = useMemo(() => {
    if (!upcomingPromotions) return [];
    
    return upcomingPromotions.filter((promo: any) => {
      // Search filter
      if (searchQuery && !promo.name.toLowerCase().includes(searchQuery.toLowerCase()) 
          && !promo.account?.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Account filter
      if (accountFilter !== 'all' && promo.account?.name.toLowerCase() !== accountFilter) {
        return false;
      }
      
      // Status filter
      if (statusFilter !== 'all' && promo.status !== statusFilter) {
        return false;
      }
      
      return true;
    });
  }, [upcomingPromotions, searchQuery, accountFilter, statusFilter]);

  // Generate calendar grid for current month
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const calendarDays = [];
  const current = new Date(startDate);
  
  for (let i = 0; i < 42; i++) {
    calendarDays.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getPromotionsForDay = (date: Date) => {
    if (!filteredPromotions) return [];
    
    return filteredPromotions.filter((promo: any) => {
      const startDate = new Date(promo.startDate);
      const endDate = new Date(promo.endDate);
      return date >= startDate && date <= endDate;
    });
  };

  const getPromotionColor = (type: string) => {
    switch (type) {
      case 'bogo':
        return 'bg-primary text-white';
      case 'discount':
        return 'bg-secondary text-white';
      case 'coupon':
        return 'bg-accent text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Upcoming Promotions Calendar
          </CardTitle>
          <div className="flex space-x-2">
            <Button variant="default" size="sm" className="bg-primary text-white">
              Month
            </Button>
            <Button variant="outline" size="sm">
              Week
            </Button>
            <Button variant="outline" size="sm">
              List
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar Header */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.slice(0, 35).map((date, index) => {
            const isCurrentMonth = date.getMonth() === currentMonth;
            const isToday = date.toDateString() === today.toDateString();
            const dayPromotions = getPromotionsForDay(date);

            return (
              <div
                key={index}
                className={`h-20 p-1 border border-gray-100 rounded relative ${
                  !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                } ${isToday ? 'ring-2 ring-primary' : ''}`}
              >
                <span
                  className={`text-sm ${
                    !isCurrentMonth
                      ? 'text-gray-400'
                      : isToday
                      ? 'text-primary font-semibold'
                      : 'text-gray-600'
                  }`}
                >
                  {date.getDate()}
                </span>
                
                {dayPromotions.length > 0 && (
                  <div className="mt-1 space-y-1">
                    {dayPromotions.slice(0, 2).map((promo: any, promoIndex: number) => (
                      <div
                        key={promoIndex}
                        className={`text-xs px-1 rounded truncate ${getPromotionColor(promo.promotionType)}`}
                        title={promo.name}
                      >
                        {promo.account?.name || 'Promo'}
                      </div>
                    ))}
                    {dayPromotions.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{dayPromotions.length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {isLoading && (
          <div className="text-center py-4">
            <p className="text-gray-500">Loading calendar...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
