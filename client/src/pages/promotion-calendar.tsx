import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PromotionForm from "@/components/promotions/promotion-form";
import type { Promotion, Account } from "@shared/schema";

export default function PromotionCalendar() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: promotions, isLoading } = useQuery({
    queryKey: ["/api/promotions"],
    enabled: isAuthenticated,
  });

  const { data: upcomingPromotions } = useQuery({
    queryKey: ["/api/promotions/upcoming"],
    enabled: isAuthenticated,
  });

  if (authLoading || (!isAuthenticated && authLoading)) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'planned':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPromotionTypeColor = (type: string) => {
    switch (type) {
      case 'bogo':
        return 'bg-purple-100 text-purple-800';
      case 'discount':
        return 'bg-orange-100 text-orange-800';
      case 'coupon':
        return 'bg-cyan-100 text-cyan-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-screen bg-neutral">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Promotion Calendar</h2>
              <p className="text-sm text-gray-600">Manage and track all promotional activities</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-white hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    New Promotion
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Promotion</DialogTitle>
                  </DialogHeader>
                  <PromotionForm onSuccess={() => setIsFormOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Upcoming Promotions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Upcoming Promotions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingPromotions?.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No upcoming promotions scheduled</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingPromotions?.map((promotion: Promotion & { account: Account | null }) => (
                    <Card key={promotion.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{promotion.name}</h3>
                          <Badge className={getStatusColor(promotion.status)}>
                            {promotion.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {promotion.account?.name || 'No account'}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">
                            {new Date(promotion.startDate).toLocaleDateString()} - {new Date(promotion.endDate).toLocaleDateString()}
                          </span>
                          <Badge className={getPromotionTypeColor(promotion.promotionType)}>
                            {promotion.promotionType}
                          </Badge>
                        </div>
                        <div className="mt-2 text-sm font-medium text-gray-900">
                          Budget: ${Number(promotion.budget).toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* All Promotions */}
          <Card>
            <CardHeader>
              <CardTitle>All Promotions</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading promotions...</div>
              ) : promotions?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No promotions found</p>
                  <Button onClick={() => setIsFormOpen(true)}>
                    Create your first promotion
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Account</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Period</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Budget</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {promotions?.map((promotion: Promotion & { account: Account | null }) => (
                        <tr key={promotion.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{promotion.name}</td>
                          <td className="py-3 px-4 text-gray-600">{promotion.account?.name || 'No account'}</td>
                          <td className="py-3 px-4">
                            <Badge className={getPromotionTypeColor(promotion.promotionType)}>
                              {promotion.promotionType}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {new Date(promotion.startDate).toLocaleDateString()} - {new Date(promotion.endDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-900">
                            ${Number(promotion.budget).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(promotion.status)}>
                              {promotion.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
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
