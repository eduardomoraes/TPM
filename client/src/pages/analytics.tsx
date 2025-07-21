import { useState, useMemo, createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FilteredROIChart from "@/components/analytics/filtered-roi-chart";
import { TrendingUp, DollarSign, Target, BarChart3, PieChart, Users, Layers, Filter, X } from "lucide-react";
import type { Promotion, Account, Product, SalesData } from "@shared/schema";

// Create a filter context for analytics components
interface AnalyticsFilterContextType {
  searchQuery: string;
  dateRange: string;
  accountFilter: string;
  statusFilter: string;
  applyFilters: (data: any[]) => any[];
}

const AnalyticsFilterContext = createContext<AnalyticsFilterContextType>({
  searchQuery: "",
  dateRange: "all",
  accountFilter: "all",
  statusFilter: "all",
  applyFilters: (data) => data,
});

function Analytics() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [consolidatedView, setConsolidatedView] = useState<'account' | 'promo-type'>('account');
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [accountFilter, setAccountFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const { data: kpis } = useQuery({
    queryKey: ["/api/dashboard/kpis"],
    enabled: isAuthenticated,
  });

  const { data: topPromotions } = useQuery({
    queryKey: ["/api/dashboard/top-promotions"],
    enabled: isAuthenticated,
  });

  const { data: salesData } = useQuery<(SalesData & { promotion: Promotion | null; account: Account | null; product: Product | null })[]>({
    queryKey: ["/api/sales-data"],
    enabled: isAuthenticated,
  });

  const { data: allPromotions } = useQuery<(Promotion & { account: Account | null; product: Product | null })[]>({
    queryKey: ["/api/promotions"],
    enabled: isAuthenticated,
  });

  const { data: accounts } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
    enabled: isAuthenticated,
  });

  // Filter function to apply master filters to data
  const applyFilters = useMemo(() => {
    return (data: any[]) => {
      if (!data || !Array.isArray(data)) return [];
      
      return data.filter((item: any) => {
        // Search filter
        if (searchQuery) {
          const searchFields = [
            item.name,
            item.account?.name,
            item.product?.name,
            item.promotion?.name,
            item.type,
            item.message
          ].filter(Boolean);
          
          if (!searchFields.some(field => 
            field.toLowerCase().includes(searchQuery.toLowerCase())
          )) {
            return false;
          }
        }
        
        // Account filter
        if (accountFilter !== 'all') {
          const itemAccountName = item.account?.name || item.accountName;
          if (itemAccountName !== accountFilter) {
            return false;
          }
        }
        
        // Status filter
        if (statusFilter !== 'all' && item.status && item.status !== statusFilter) {
          return false;
        }
        
        // Date range filter
        if (dateRange !== 'all') {
          const itemDate = new Date(item.createdAt || item.startDate || item.salesDate || '');
          const now = new Date();
          
          switch (dateRange) {
            case 'today':
              if (itemDate.toDateString() !== now.toDateString()) return false;
              break;
            case 'week':
              const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              if (itemDate < weekAgo) return false;
              break;
            case 'month':
              if (itemDate.getMonth() !== now.getMonth() || itemDate.getFullYear() !== now.getFullYear()) return false;
              break;
            case 'quarter':
              const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
              if (itemDate < quarterStart) return false;
              break;
            case 'year':
              if (itemDate.getFullYear() !== now.getFullYear()) return false;
              break;
          }
        }
        
        return true;
      });
    };
  }, [searchQuery, dateRange, accountFilter, statusFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setDateRange("all");
    setAccountFilter("all");
    setStatusFilter("all");
  };

  // Filter context value
  const filterContextValue = {
    searchQuery,
    dateRange,
    accountFilter,
    statusFilter,
    applyFilters,
  };

  if (authLoading || (!isAuthenticated && authLoading)) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  // Apply filters to data
  const filteredSalesData = useMemo(() => applyFilters(Array.isArray(salesData) ? salesData : []), [salesData, applyFilters]);
  const filteredPromotions = useMemo(() => applyFilters(Array.isArray(allPromotions) ? allPromotions : []), [allPromotions, applyFilters]);
  const filteredTopPromotions = useMemo(() => applyFilters(Array.isArray(topPromotions) ? topPromotions : []), [topPromotions, applyFilters]);

  // Calculate additional analytics metrics based on filtered data
  const totalIncrementalSales = filteredSalesData.reduce((sum: number, sale: any) => 
    sum + (Number(sale.incrementalSales) || 0), 0);
  
  const avgROI = filteredSalesData.length > 0 
    ? filteredSalesData.reduce((sum: number, sale: any) => sum + (Number(sale.roi) || 0), 0) / filteredSalesData.length
    : (kpis && typeof kpis === 'object' && 'averageROI' in kpis ? (kpis as any).averageROI : 0) || 0;
    
  const totalPromotionsAnalyzed = filteredTopPromotions.length;
  const totalTradeSpend = filteredPromotions.reduce((sum: number, promo: any) => sum + (Number(promo.budget) || 0), 0);

  // Consolidated analysis by account (using filtered data)
  const consolidatedByAccount = useMemo(() => {
    if (!filteredPromotions || !filteredSalesData) return [];
    
    const accountMap = new Map();
    
    filteredPromotions.forEach((promo: any) => {
      const accountName = promo.account?.name || 'Unknown';
      if (!accountMap.has(accountName)) {
        accountMap.set(accountName, {
          name: accountName,
          totalBudget: 0,
          totalSales: 0,
          promotionCount: 0,
          avgROI: 0,
          totalROI: 0,
          totalUnitsLift: 0,
        });
      }
      
      const accountData = accountMap.get(accountName);
      accountData.totalBudget += Number(promo.budget) || 0;
      accountData.promotionCount += 1;
      
      // Find related sales data
      const relatedSales = filteredSalesData.filter((sale: any) => sale.promotion?.accountId === promo.accountId);
      relatedSales.forEach((sale: any) => {
        accountData.totalSales += Number(sale.incrementalSales) || 0;
        accountData.totalUnitsLift += Number(sale.unitsLift) || 0;
      });
    });
    
    // Calculate average ROI for each account
    Array.from(accountMap.values()).forEach((account: any) => {
      if (account.totalBudget > 0) {
        account.avgROI = (account.totalSales / account.totalBudget) * 100;
      }
    });
    
    return Array.from(accountMap.values()).sort((a: any, b: any) => b.avgROI - a.avgROI);
  }, [filteredPromotions, filteredSalesData]);

  // Consolidated analysis by promo type (using filtered data)
  const consolidatedByPromoType = useMemo(() => {
    if (!filteredPromotions || !filteredSalesData) return [];
    
    const typeMap = new Map();
    
    filteredPromotions.forEach((promo: any) => {
      const promoType = promo.promotionType || 'Unknown';
      if (!typeMap.has(promoType)) {
        typeMap.set(promoType, {
          type: promoType,
          totalBudget: 0,
          totalSales: 0,
          promotionCount: 0,
          avgROI: 0,
          totalUnitsLift: 0,
          accounts: new Set(),
        });
      }
      
      const typeData = typeMap.get(promoType);
      typeData.totalBudget += Number(promo.budget) || 0;
      typeData.promotionCount += 1;
      typeData.accounts.add(promo.account?.name || 'Unknown');
      
      // Find related sales data
      const relatedSales = filteredSalesData.filter((sale: any) => sale.promotionId === promo.id);
      relatedSales.forEach((sale: any) => {
        typeData.totalSales += Number(sale.incrementalSales) || 0;
        typeData.totalUnitsLift += Number(sale.unitsLift) || 0;
      });
    });
    
    // Calculate average ROI for each type and convert accounts set to count
    Array.from(typeMap.values()).forEach((type: any) => {
      if (type.totalBudget > 0) {
        type.avgROI = (type.totalSales / type.totalBudget) * 100;
      }
      type.accountCount = type.accounts.size;
      delete type.accounts; // Remove the Set for cleaner data
    });
    
    return Array.from(typeMap.values()).sort((a: any, b: any) => b.avgROI - a.avgROI);
  }, [filteredPromotions, filteredSalesData]);

  const currentConsolidatedData = consolidatedView === 'account' ? consolidatedByAccount : consolidatedByPromoType;

  return (
    <AnalyticsFilterContext.Provider value={filterContextValue}>
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
              
              {/* Master Filter Toggle */}
              <div className="flex items-center space-x-4">
                <Button
                  variant={showFilters ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </Button>
              </div>
            </div>

            {/* Master Filter Panel */}
            {showFilters && (
              <Card className="mb-6">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Filter Analytics Data</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="space-y-2">
                      <Label htmlFor="search">Search</Label>
                      <Input
                        id="search"
                        placeholder="Search promotions, accounts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Date Range */}
                    <div className="space-y-2">
                      <Label htmlFor="dateRange">Date Range</Label>
                      <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="week">This Week</SelectItem>
                          <SelectItem value="month">This Month</SelectItem>
                          <SelectItem value="quarter">This Quarter</SelectItem>
                          <SelectItem value="year">This Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Account */}
                    <div className="space-y-2">
                      <Label htmlFor="account">Account</Label>
                      <Select value={accountFilter} onValueChange={setAccountFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Accounts" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Accounts</SelectItem>
                          {accounts?.map((account) => (
                            <SelectItem key={account.id} value={account.name}>
                              {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="planned">Planned</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Filter Actions */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      {filteredPromotions.length} promotion(s), {filteredSalesData.length} sales record(s) shown
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={clearFilters}>
                        Clear All
                      </Button>
                      <Button variant="default" size="sm">
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
                  {totalTradeSpend && totalIncrementalSales ? 
                    (totalIncrementalSales / totalTradeSpend * 100).toFixed(0) : 0}%
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

          {/* Consolidated Performance Analysis */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  <CardTitle>Consolidated Performance Analysis</CardTitle>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium">Analyze by:</label>
                    <Select value={consolidatedView} onValueChange={(value: string) => setConsolidatedView(value as 'account' | 'promo-type')}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="account">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            Account
                          </div>
                        </SelectItem>
                        <SelectItem value="promo-type">
                          <div className="flex items-center">
                            <Layers className="h-4 w-4 mr-2" />
                            Promo Type
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!currentConsolidatedData || currentConsolidatedData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No data available for consolidated analysis</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          {consolidatedView === 'account' ? 'Account' : 'Promotion Type'}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Total Budget</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Incremental Sales</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Promotions</th>
                        {consolidatedView === 'promo-type' && (
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Accounts</th>
                        )}
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Units Lift</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Avg ROI</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentConsolidatedData && currentConsolidatedData.map((item: any, index: number) => {
                        const roi = item.avgROI || 0;
                        const displayName = consolidatedView === 'account' ? item.name : item.type;
                        
                        return (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-gray-900">{displayName}</td>
                            <td className="py-3 px-4 font-medium text-gray-900">
                              ${item.totalBudget.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 font-medium text-green-600">
                              ${item.totalSales.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-gray-600">{item.promotionCount}</td>
                            {consolidatedView === 'promo-type' && (
                              <td className="py-3 px-4 text-gray-600">{item.accountCount}</td>
                            )}
                            <td className="py-3 px-4 text-blue-600">
                              +{item.totalUnitsLift.toLocaleString()} units
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-semibold text-green-600">+{roi.toFixed(0)}%</span>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={roi > 200 ? 'bg-green-100 text-green-800' : 
                                               roi > 150 ? 'bg-blue-100 text-blue-800' : 
                                               roi > 100 ? 'bg-yellow-100 text-yellow-800' :
                                               'bg-red-100 text-red-800'}>
                                {roi > 200 ? 'Excellent' : roi > 150 ? 'Good' : roi > 100 ? 'Average' : 'Below Target'}
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

          {/* ROI Trend Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <FilteredROIChart 
              filteredSalesData={filteredSalesData}
              searchQuery={searchQuery}
              dateRange={dateRange}
              accountFilter={accountFilter}
              statusFilter={statusFilter}
            />
            
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
                      <h4 className="font-medium text-green-900">
                        {consolidatedView === 'account' ? 'Top Account Performance' : 'Best Promo Strategy'}
                      </h4>
                    </div>
                    <p className="text-sm text-green-700">
                      {consolidatedView === 'account' 
                        ? (consolidatedByAccount[0] ? `${consolidatedByAccount[0].name} leads with ${consolidatedByAccount[0].avgROI.toFixed(0)}% ROI` : 'No account data available')
                        : (consolidatedByPromoType[0] ? `${consolidatedByPromoType[0].type} promotions show highest ROI at ${consolidatedByPromoType[0].avgROI.toFixed(0)}%` : 'No promotion type data available')
                      }
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center mb-2">
                      <Target className="h-5 w-5 text-blue-600 mr-2" />
                      <h4 className="font-medium text-blue-900">Investment Analysis</h4>
                    </div>
                    <p className="text-sm text-blue-700">
                      {consolidatedView === 'account' 
                        ? `Total budget allocated across ${consolidatedByAccount.length} accounts: $${consolidatedByAccount.reduce((sum: number, acc: any) => sum + acc.totalBudget, 0).toLocaleString()}`
                        : `${consolidatedByPromoType.length} promotion types analyzed with $${consolidatedByPromoType.reduce((sum: number, type: any) => sum + type.totalBudget, 0).toLocaleString()} total investment`
                      }
                    </p>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center mb-2">
                      <BarChart3 className="h-5 w-5 text-yellow-600 mr-2" />
                      <h4 className="font-medium text-yellow-900">Optimization Opportunity</h4>
                    </div>
                    <p className="text-sm text-yellow-700">
                      {consolidatedView === 'account' 
                        ? 'Focus on underperforming accounts to improve overall portfolio ROI'
                        : 'Expand investment in top-performing promotion types for maximum returns'
                      }
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
              {!topPromotions || !Array.isArray(topPromotions) || topPromotions.length === 0 ? (
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
                      {Array.isArray(topPromotions) ? topPromotions.map((promotion: any) => {
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
                      }) : null}
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
    </AnalyticsFilterContext.Provider>
  );
}

export default Analytics;
