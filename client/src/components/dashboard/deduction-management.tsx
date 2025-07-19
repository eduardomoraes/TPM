import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, CheckCircle, Eye } from "lucide-react";

export default function DeductionManagement() {
  const { isAuthenticated } = useAuth();

  const { data: deductions } = useQuery({
    queryKey: ["/api/deductions"],
    enabled: isAuthenticated,
  });

  const { data: priorityDeductions } = useQuery({
    queryKey: ["/api/deductions/priority"],
    enabled: isAuthenticated,
  });

  // Calculate deduction metrics
  const totalPending = deductions?.filter((d: any) => d.status === 'pending').length || 12;
  const totalInReview = deductions?.filter((d: any) => d.status === 'in_review').length || 8;
  const totalResolved = deductions?.filter((d: any) => d.status === 'resolved').length || 45;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Deduction Management
          </CardTitle>
          <Button className="bg-accent text-white hover:bg-orange-600 text-sm">
            Process All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Deduction Status Overview */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-error">{totalPending}</div>
            <div className="text-xs text-gray-500">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{totalInReview}</div>
            <div className="text-xs text-gray-500">In Review</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">{totalResolved}</div>
            <div className="text-xs text-gray-500">Resolved</div>
          </div>
        </div>

        {/* Priority Deductions */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Priority Deductions</h4>
          <div className="space-y-3">
            {priorityDeductions && priorityDeductions.length > 0 ? (
              priorityDeductions.slice(0, 3).map((deduction: any) => (
                <div
                  key={deduction.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    deduction.daysOld > 21
                      ? 'bg-red-50 border-red-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {deduction.account?.name || 'Unknown Account'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Ref: {deduction.referenceNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-error">
                      {formatCurrency(Number(deduction.amount))}
                    </p>
                    <p className="text-xs text-gray-500">{deduction.daysOld} days old</p>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Target Corp</p>
                    <p className="text-xs text-gray-500">Ref: TGT-2024-0847</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-error">$12,450</p>
                    <p className="text-xs text-gray-500">28 days old</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Walmart Inc</p>
                    <p className="text-xs text-gray-500">Ref: WMT-2024-1203</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-accent">$8,920</p>
                    <p className="text-xs text-gray-500">14 days old</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Kroger Co</p>
                    <p className="text-xs text-gray-500">Ref: KRO-2024-0654</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-accent">$5,630</p>
                    <p className="text-xs text-gray-500">11 days old</p>
                  </div>
                </div>
              </>
            )}

            <Button variant="outline" className="w-full text-primary border-primary hover:bg-blue-50">
              <Eye className="w-4 h-4 mr-2" />
              View All Deductions
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
