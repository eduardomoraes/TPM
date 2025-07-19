import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ROIChart() {
  const { isAuthenticated } = useAuth();

  const { data: roiTrend, isLoading } = useQuery({
    queryKey: ["/api/dashboard/roi-trend"],
    enabled: isAuthenticated,
  });

  const chartData = {
    labels: roiTrend?.map((item: any) => item.month) || [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ],
    datasets: [
      {
        label: "ROI %",
        data: roiTrend?.map((item: any) => item.roi) || [
          180, 195, 220, 210, 240, 235, 260, 250, 270, 280, 275, 290
        ],
        borderColor: "hsl(207, 90%, 54%)",
        backgroundColor: "hsla(207, 90%, 54%, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "hsl(207, 90%, 54%)",
        pointBorderColor: "white",
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "hsl(207, 90%, 54%)",
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 150,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          callback: function(value: any) {
            return value + "%";
          },
          color: "rgba(0, 0, 0, 0.6)",
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "rgba(0, 0, 0, 0.6)",
        },
      },
    },
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            ROI Trend Analysis
          </CardTitle>
          <Select defaultValue="last-12-months">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-12-months">Last 12 months</SelectItem>
              <SelectItem value="last-6-months">Last 6 months</SelectItem>
              <SelectItem value="ytd">YTD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Loading chart...</div>
            </div>
          ) : (
            <Line data={chartData} options={chartOptions} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
