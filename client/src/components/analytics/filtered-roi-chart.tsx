import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useContext, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { TrendingUp } from "lucide-react";
import { useState } from "react";
import type { SalesData } from "@shared/schema";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface FilteredROIChartProps {
  filteredSalesData: any[];
  searchQuery: string;
  dateRange: string;
  accountFilter: string;
  statusFilter: string;
}

export default function FilteredROIChart({ 
  filteredSalesData, 
  searchQuery, 
  dateRange, 
  accountFilter, 
  statusFilter 
}: FilteredROIChartProps) {
  const { isAuthenticated } = useAuth();
  const [timePeriod, setTimePeriod] = useState("last-12-months");
  const [viewBy, setViewBy] = useState("months");

  // Generate ROI trend data from filtered sales data
  const roiTrendData = useMemo(() => {
    if (!filteredSalesData || filteredSalesData.length === 0) return [];

    const now = new Date();
    let startDate;

    switch (timePeriod) {
      case "last-month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case "last-3-months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case "last-6-months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case "ytd":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case "last-12-months":
      default:
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        break;
    }

    // Filter sales data by date range
    const relevantSalesData = filteredSalesData.filter((sale) => {
      const saleDate = new Date(sale.salesDate || '');
      return saleDate >= startDate;
    });

    // Group by month or week
    const grouped = new Map();

    relevantSalesData.forEach((sale) => {
      const saleDate = new Date(sale.salesDate || '');
      let key;

      if (viewBy === "weeks") {
        const weekNumber = Math.ceil(saleDate.getDate() / 7);
        key = `Week ${weekNumber} - ${saleDate.toLocaleDateString('en-US', { month: 'short' })}`;
      } else {
        key = saleDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      }

      if (!grouped.has(key)) {
        grouped.set(key, { totalROI: 0, count: 0 });
      }

      const group = grouped.get(key);
      group.totalROI += Number(sale.roi) || 0;
      group.count += 1;
    });

    // Calculate average ROI for each period
    return Array.from(grouped.entries()).map(([month, data]) => ({
      month,
      roi: data.count > 0 ? data.totalROI / data.count : 0,
    })).sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredSalesData, timePeriod, viewBy]);

  const chartData = {
    labels: roiTrendData.map(item => item.month),
    datasets: [
      {
        label: "Average ROI (%)",
        data: roiTrendData.map(item => item.roi),
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#3B82F6",
        pointBorderColor: "#FFFFFF",
        pointBorderWidth: 2,
        pointRadius: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          font: {
            size: 11,
          },
          callback: function(value: any) {
            return value + '%';
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold text-gray-900">
              ROI Trend Analysis (Filtered)
            </CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                <SelectItem value="last-12-months">Last 12 Months</SelectItem>
                <SelectItem value="ytd">Year to Date</SelectItem>
              </SelectContent>
            </Select>
            <Select value={viewBy} onValueChange={setViewBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="months">Monthly</SelectItem>
                <SelectItem value="weeks">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {roiTrendData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No ROI data available for the selected filters and time period
            </p>
          </div>
        ) : (
          <div className="h-80">
            <Line data={chartData} options={chartOptions} />
          </div>
        )}
        
        {/* Filter summary */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-2 text-xs text-gray-600">
            <span>Filters applied:</span>
            {searchQuery && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Search: {searchQuery}</span>}
            {dateRange !== 'all' && <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Date: {dateRange}</span>}
            {accountFilter !== 'all' && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">Account: {accountFilter}</span>}
            {statusFilter !== 'all' && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">Status: {statusFilter}</span>}
            {!searchQuery && dateRange === 'all' && accountFilter === 'all' && statusFilter === 'all' && (
              <span className="text-gray-500">No filters applied</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}