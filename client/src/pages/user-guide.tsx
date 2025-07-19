import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, 
  BarChart3, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  Users, 
  Target,
  CheckCircle,
  AlertCircle,
  Info,
  Lightbulb
} from "lucide-react";

export default function UserGuide() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-neutral">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-neutral">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">User Guide</h1>
          <p className="text-muted-foreground">Complete guide to mastering the Trade Promotion Management platform</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Getting Started Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Getting Started
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Platform Overview</h4>
                <p className="text-sm text-muted-foreground">
                  The TPM platform helps CPG companies manage trade promotions end-to-end, from planning 
                  and forecasting to execution and ROI analysis.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Key Benefits</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Optimize promotional ROI</li>
                  <li>• Automate deduction processing</li>
                  <li>• Track budget utilization</li>
                  <li>• Forecast demand accurately</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Dashboard - Your Command Center
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">1</Badge>
                <div className="space-y-2">
                  <h4 className="font-semibold">KPI Cards Overview</h4>
                  <p className="text-sm text-muted-foreground">
                    Monitor key metrics at a glance: Trade Spend YTD, Average ROI, Active Promotions, and Pending Deductions.
                  </p>
                  <div className="bg-muted/50 p-3 rounded-lg text-sm">
                    <strong>Example:</strong> Trade Spend YTD of $837K indicates total promotional investment this year. 
                    Average ROI of 4.2% shows overall campaign effectiveness.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">2</Badge>
                <div className="space-y-2">
                  <h4 className="font-semibold">ROI Trend Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    Track monthly ROI performance to identify seasonal patterns and optimization opportunities.
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Info className="h-4 w-4 text-blue-600" />
                      <strong>Pro Tip:</strong>
                    </div>
                    Look for ROI dips to identify underperforming periods and adjust future planning accordingly.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">3</Badge>
                <div className="space-y-2">
                  <h4 className="font-semibold">Top Performing Promotions</h4>
                  <p className="text-sm text-muted-foreground">
                    Identify your most successful campaigns to replicate winning strategies.
                  </p>
                  <div className="bg-muted/50 p-3 rounded-lg text-sm">
                    <strong>How to use:</strong> Click on any promotion to view detailed performance metrics 
                    and learn what made it successful.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Promotion Calendar Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Promotion Calendar - Planning & Execution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">1</Badge>
                <div className="space-y-2">
                  <h4 className="font-semibold">Creating Promotions</h4>
                  <p className="text-sm text-muted-foreground">
                    Plan new campaigns with detailed forecasting and budget allocation.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm"><strong>Required fields:</strong> Name, Account, Product, Dates, Type, Budget</p>
                    <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Lightbulb className="h-4 w-4 text-green-600" />
                        <strong>Best Practice:</strong>
                      </div>
                      Set realistic forecasted volumes based on historical performance of similar promotions.
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">2</Badge>
                <div className="space-y-2">
                  <h4 className="font-semibold">Promotion Types</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><strong>BOGO:</strong> Buy-one-get-one offers</div>
                    <div><strong>Discount:</strong> Percentage or fixed amount off</div>
                    <div><strong>Coupon:</strong> Manufacturer or retailer coupons</div>
                    <div><strong>Rebate:</strong> Cash-back incentives</div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">3</Badge>
                <div className="space-y-2">
                  <h4 className="font-semibold">Status Management</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Planned</Badge>
                    <Badge variant="default">Active</Badge>
                    <Badge variant="outline">Completed</Badge>
                    <Badge variant="destructive">Cancelled</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Track promotions through their lifecycle and update status as campaigns progress.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget Management Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Budget Management - Financial Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">1</Badge>
                <div className="space-y-2">
                  <h4 className="font-semibold">Quarterly Budget Overview</h4>
                  <p className="text-sm text-muted-foreground">
                    Monitor budget allocation and spending across different quarters and accounts.
                  </p>
                  <div className="bg-muted/50 p-3 rounded-lg text-sm">
                    <strong>Example:</strong> Q3-2024 shows $829K total budget with $320K spent (38.5% utilization).
                    This indicates healthy spending pace with room for additional promotions.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">2</Badge>
                <div className="space-y-2">
                  <h4 className="font-semibold">Budget Allocation Strategy</h4>
                  <p className="text-sm text-muted-foreground">
                    Distribute budgets across accounts based on performance, potential, and strategic importance.
                  </p>
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <strong>Warning:</strong>
                    </div>
                    Monitor utilization rates. Accounts nearing 90% budget usage may need additional allocation 
                    or spending optimization.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deductions Management Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-600" />
              Deduction Management - Automated Processing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">1</Badge>
                <div className="space-y-2">
                  <h4 className="font-semibold">Processing Workflow</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Priority Queue:</strong> Focus on high-value or aging deductions first
                    </div>
                    <div>
                      <strong>Status Tracking:</strong> Monitor progress from pending to resolved
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">2</Badge>
                <div className="space-y-2">
                  <h4 className="font-semibold">Validation Process</h4>
                  <ol className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>1. Review deduction details and supporting documentation</li>
                    <li>2. Verify against promotion agreements and terms</li>
                    <li>3. Update status (Approve, Dispute, or Request More Info)</li>
                    <li>4. Process payment or escalate for resolution</li>
                  </ol>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">3</Badge>
                <div className="space-y-2">
                  <h4 className="font-semibold">Best Practices</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Process deductions within 30 days to maintain retailer relationships</li>
                    <li>• Document all decisions and communications for audit purposes</li>
                    <li>• Flag recurring issues for process improvement</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Forecasting Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              Forecasting - AI-Powered Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">1</Badge>
                <div className="space-y-2">
                  <h4 className="font-semibold">Demand Planning</h4>
                  <p className="text-sm text-muted-foreground">
                    Use historical data and market trends to predict promotional impact on sales volume.
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-4 w-4 text-blue-600" />
                      <strong>Key Metrics:</strong>
                    </div>
                    Baseline sales, lift percentage, incremental volume, and cannibalization effects.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">2</Badge>
                <div className="space-y-2">
                  <h4 className="font-semibold">ROI Optimization</h4>
                  <p className="text-sm text-muted-foreground">
                    Identify the optimal promotion mix to maximize return on investment.
                  </p>
                  <div className="bg-muted/50 p-3 rounded-lg text-sm">
                    <strong>Formula:</strong> ROI = (Incremental Profit - Promotion Cost) / Promotion Cost × 100
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-red-600" />
              Analytics & Reporting - Data-Driven Decisions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">1</Badge>
                <div className="space-y-2">
                  <h4 className="font-semibold">Performance Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    Deep dive into promotion effectiveness across accounts, products, and time periods.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><strong>Sales Lift:</strong> Volume and revenue impact</div>
                    <div><strong>Market Share:</strong> Category penetration</div>
                    <div><strong>Customer Metrics:</strong> New vs. repeat buyers</div>
                    <div><strong>Profit Analysis:</strong> Gross and net profitability</div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">2</Badge>
                <div className="space-y-2">
                  <h4 className="font-semibold">Comparative Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    Compare performance across different promotion types, accounts, and time periods.
                  </p>
                  <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb className="h-4 w-4 text-green-600" />
                      <strong>Insight:</strong>
                    </div>
                    Use A/B testing to compare similar promotions and identify winning strategies.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips & Best Practices */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Expert Tips & Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-primary">Strategic Planning</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Plan promotions 8-12 weeks in advance</li>
                  <li>• Align with retailer promotional calendars</li>
                  <li>• Consider competitive landscape and timing</li>
                  <li>• Set clear success metrics before launch</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-primary">Execution Excellence</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Monitor performance weekly during campaigns</li>
                  <li>• Respond quickly to underperformance</li>
                  <li>• Document learnings for future optimization</li>
                  <li>• Maintain strong retailer relationships</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Reference */}
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle>Quick Actions Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h5 className="font-semibold mb-2">Daily Tasks</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Review dashboard KPIs</li>
                  <li>• Process priority deductions</li>
                  <li>• Check active promotion performance</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold mb-2">Weekly Tasks</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Analyze ROI trends</li>
                  <li>• Update promotion forecasts</li>
                  <li>• Review budget utilization</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold mb-2">Monthly Tasks</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Generate performance reports</li>
                  <li>• Plan next quarter promotions</li>
                  <li>• Review and optimize strategies</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}