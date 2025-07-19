import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, AlertTriangle, CheckCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Deduction, Account, Promotion } from "@shared/schema";

export default function Deductions() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: deductions, isLoading } = useQuery({
    queryKey: ["/api/deductions"],
    enabled: isAuthenticated,
  });

  const { data: priorityDeductions } = useQuery({
    queryKey: ["/api/deductions/priority"],
    enabled: isAuthenticated,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest("PUT", `/api/deductions/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deductions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/deductions/priority"] });
      toast({
        title: "Success",
        description: "Deduction status updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update deduction status",
        variant: "destructive",
      });
    },
  });

  if (authLoading || (!isAuthenticated && authLoading)) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-red-100 text-red-800';
      case 'in_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'disputed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'in_review':
        return <AlertTriangle className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleStatusUpdate = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  // Calculate deduction metrics
  const totalPending = deductions?.filter((d: Deduction) => d.status === 'pending').length || 0;
  const totalInReview = deductions?.filter((d: Deduction) => d.status === 'in_review').length || 0;
  const totalResolved = deductions?.filter((d: Deduction) => d.status === 'resolved').length || 0;
  const pendingAmount = deductions?.filter((d: Deduction) => d.status === 'pending')
    .reduce((sum: number, d: Deduction) => sum + Number(d.amount), 0) || 0;

  // Filter deductions based on status
  const filteredDeductions = deductions?.filter((d: Deduction) => 
    statusFilter === "all" || d.status === statusFilter) || [];

  return (
    <div className="flex h-screen bg-neutral">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Deduction Management</h2>
              <p className="text-sm text-gray-600">Track and manage trade promotion deductions</p>
            </div>
            <Button className="bg-accent text-white hover:bg-orange-600">
              Process All Pending
            </Button>
          </div>

          {/* Deduction Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{totalPending}</div>
                <p className="text-xs text-muted-foreground">
                  ${pendingAmount.toLocaleString()} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Review</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{totalInReview}</div>
                <p className="text-xs text-muted-foreground">
                  Under validation
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{totalResolved}</div>
                <p className="text-xs text-muted-foreground">
                  Successfully processed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Age</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {deductions?.length > 0 ? 
                    Math.round(deductions.reduce((sum: number, d: Deduction) => sum + d.daysOld, 0) / deductions.length) : 0} days
                </div>
                <p className="text-xs text-muted-foreground">
                  Average processing time
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Priority Deductions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                Priority Deductions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {priorityDeductions?.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No priority deductions requiring attention</p>
              ) : (
                <div className="space-y-3">
                  {priorityDeductions?.map((deduction: Deduction & { account: Account | null }) => (
                    <div 
                      key={deduction.id} 
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        deduction.daysOld > 21 ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          deduction.daysOld > 21 ? 'bg-red-100' : 'bg-yellow-100'
                        }`}>
                          {getStatusIcon(deduction.status)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{deduction.account?.name || 'Unknown Account'}</p>
                          <p className="text-sm text-gray-500">Ref: {deduction.referenceNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-bold text-lg">${Number(deduction.amount).toLocaleString()}</p>
                          <p className="text-sm text-gray-500">{deduction.daysOld} days old</p>
                        </div>
                        <Select 
                          value={deduction.status} 
                          onValueChange={(value) => handleStatusUpdate(deduction.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_review">In Review</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="disputed">Disputed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* All Deductions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Deductions</CardTitle>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="disputed">Disputed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading deductions...</div>
              ) : filteredDeductions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No deductions found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Reference</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Account</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Submitted</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Age</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDeductions.map((deduction: Deduction & { account: Account | null; promotion: Promotion | null }) => (
                        <tr key={deduction.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{deduction.referenceNumber}</td>
                          <td className="py-3 px-4 text-gray-600">{deduction.account?.name || 'Unknown'}</td>
                          <td className="py-3 px-4 font-medium text-gray-900">
                            ${Number(deduction.amount).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {new Date(deduction.submittedDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`font-medium ${deduction.daysOld > 21 ? 'text-red-600' : deduction.daysOld > 14 ? 'text-yellow-600' : 'text-gray-600'}`}>
                              {deduction.daysOld} days
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(deduction.status)}>
                              {deduction.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Select 
                              value={deduction.status} 
                              onValueChange={(value) => handleStatusUpdate(deduction.id, value)}
                            >
                              <SelectTrigger className="w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in_review">In Review</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="disputed">Disputed</SelectItem>
                              </SelectContent>
                            </Select>
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
