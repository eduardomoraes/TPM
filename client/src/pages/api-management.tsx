import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Key, Plus, Copy, Trash2, Eye, EyeOff, Code, Database, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  description: string;
  createdAt: string;
  lastUsed?: string;
  isActive: boolean;
}

export default function ApiManagement() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [showKey, setShowKey] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyDescription, setNewKeyDescription] = useState("");

  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ['/api/admin/api-keys'],
    enabled: isAuthenticated,
  });

  const createKeyMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/api-keys'] });
      setIsCreateDialogOpen(false);
      setNewKeyName("");
      setNewKeyDescription("");
      toast({
        title: "API Key Created",
        description: "Your new API key has been generated successfully.",
      });
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const response = await fetch(`/api/admin/api-keys/${keyId}`, {
        method: 'DELETE',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/api-keys'] });
      toast({
        title: "API Key Deleted",
        description: "The API key has been permanently deleted.",
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "API key copied to clipboard.",
    });
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKey(showKey === keyId ? null : keyId);
  };

  const generateDatabricksCode = (apiKey: string) => {
    return `import requests
import json
from datetime import datetime

# TPM API Configuration
BASE_URL = "${window.location.origin}"
API_KEY = "${apiKey}"

headers = {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY
}

def post_sales_data(promotion_id, account_id, product_id, sales_date, metrics):
    """Post sales performance data to TPM system"""
    url = f"{BASE_URL}/api/sales-data"
    
    data = {
        "promotionId": promotion_id,
        "accountId": account_id,
        "productId": product_id,
        "salesDate": sales_date.strftime("%Y-%m-%d"),
        "unitsLift": int(metrics['units_lift']),
        "dollarLift": str(metrics['dollar_lift']),
        "baselineSales": str(metrics['baseline_sales']),
        "incrementalSales": str(metrics['incremental_sales']),
        "roi": str(metrics['roi'])
    }
    
    response = requests.post(url, json=data, headers=headers)
    return response

# Example usage
sample_metrics = {
    'units_lift': 250,
    'dollar_lift': 3250.00,
    'baseline_sales': 8000.00,
    'incremental_sales': 3250.00,
    'roi': 162.5
}

result = post_sales_data(1, 1, 1, datetime.now(), sample_metrics)
print(f"Status: {result.status_code}, Response: {result.json()}")`;
  };

  const generateCurlCode = (apiKey: string) => {
    return `# Post sales data
curl -X POST "${window.location.origin}/api/sales-data" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKey}" \\
  -d '{
    "promotionId": 1,
    "accountId": 1,
    "productId": 1,
    "salesDate": "2024-07-15",
    "unitsLift": 150,
    "dollarLift": "2500.00",
    "baselineSales": "5000.00",
    "incrementalSales": "2500.00",
    "roi": "125.50"
  }'

# Create new account
curl -X POST "${window.location.origin}/api/accounts" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKey}" \\
  -d '{
    "name": "Target Corporation",
    "type": "retailer",
    "status": "active"
  }'`;
  };

  const generatePowerBICode = (apiKey: string) => {
    return `let
    BaseUrl = "${window.location.origin}",
    ApiKey = "${apiKey}",
    
    // Function to get sales data
    GetSalesData = () =>
        let
            Headers = [
                #"Content-Type" = "application/json",
                #"X-API-Key" = ApiKey
            ],
            Response = Web.Contents(BaseUrl & "/api/sales-data", [Headers = Headers]),
            JsonResponse = Json.Document(Response)
        in
            JsonResponse,
    
    // Function to post sales data
    PostSalesData = (promotionId, accountId, productId, salesDate, unitsLift, dollarLift, baselineSales, incrementalSales, roi) =>
        let
            Headers = [
                #"Content-Type" = "application/json",
                #"X-API-Key" = ApiKey
            ],
            Body = Json.FromValue([
                promotionId = promotionId,
                accountId = accountId,
                productId = productId,
                salesDate = salesDate,
                unitsLift = unitsLift,
                dollarLift = Text.From(dollarLift),
                baselineSales = Text.From(baselineSales),
                incrementalSales = Text.From(incrementalSales),
                roi = Text.From(roi)
            ]),
            Response = Web.Contents(BaseUrl & "/api/sales-data", [
                Headers = Headers,
                Content = Body
            ])
        in
            Response

in GetSalesData()`;
  };

  if (!isAuthenticated) {
    return <div className="flex h-screen items-center justify-center">Please log in to access this page.</div>;
  }

  return (
    <div className="flex h-screen bg-neutral">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">API Key Management</h2>
              <p className="text-sm text-gray-600">Manage API keys for external system integrations</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create API Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="keyName">Name</Label>
                    <Input
                      id="keyName"
                      placeholder="e.g., Databricks Integration"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="keyDescription">Description</Label>
                    <Textarea
                      id="keyDescription"
                      placeholder="Describe what this key will be used for..."
                      value={newKeyDescription}
                      onChange={(e) => setNewKeyDescription(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={() => createKeyMutation.mutate({ name: newKeyName, description: newKeyDescription })}
                    disabled={!newKeyName || createKeyMutation.isPending}
                    className="w-full"
                  >
                    {createKeyMutation.isPending ? "Creating..." : "Create API Key"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="keys" className="space-y-6">
            <TabsList>
              <TabsTrigger value="keys">API Keys</TabsTrigger>
              <TabsTrigger value="integration">Integration Guide</TabsTrigger>
              <TabsTrigger value="endpoints">Available Endpoints</TabsTrigger>
            </TabsList>

            <TabsContent value="keys">
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    API keys provide full access to your TPM system. Keep them secure and never share them publicly.
                  </AlertDescription>
                </Alert>

                {isLoading ? (
                  <div className="text-center py-8">Loading API keys...</div>
                ) : (
                  <div className="grid gap-4">
                    {apiKeys && Array.isArray(apiKeys) && apiKeys.length > 0 ? (
                      apiKeys.map((key: ApiKey) => (
                        <Card key={key.id}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Key className="h-4 w-4" />
                                <CardTitle className="text-lg">{key.name}</CardTitle>
                                <Badge variant={key.isActive ? "default" : "secondary"}>
                                  {key.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteKeyMutation.mutate(key.id)}
                                disabled={deleteKeyMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-600 mb-4">{key.description}</p>
                            <div className="flex items-center space-x-2 mb-2">
                              <Label className="text-sm font-medium">API Key:</Label>
                              <div className="flex-1 flex items-center space-x-2">
                                <code className="bg-gray-100 px-2 py-1 rounded text-sm flex-1">
                                  {showKey === key.id ? key.key : '••••••••••••••••••••••••••••••••'}
                                </code>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => toggleKeyVisibility(key.id)}
                                >
                                  {showKey === key.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyToClipboard(key.key)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              Created: {new Date(key.createdAt).toLocaleDateString()}
                              {key.lastUsed && (
                                <span className="ml-4">Last used: {new Date(key.lastUsed).toLocaleDateString()}</span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Card>
                        <CardContent className="text-center py-8">
                          <Key className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <p className="text-gray-500">No API keys created yet</p>
                          <p className="text-sm text-gray-400">Create your first API key to enable external integrations</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="integration">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Database className="h-5 w-5" />
                      <CardTitle>Databricks Integration</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-gray-600">
                      Use this Python code in your Databricks notebooks to send sales data to the TPM system:
                    </p>
                    <Textarea
                      value={generateDatabricksCode((Array.isArray(apiKeys) && apiKeys[0]?.key) || "YOUR_API_KEY")}
                      readOnly
                      rows={20}
                      className="font-mono text-sm"
                    />
                    <Button
                      onClick={() => copyToClipboard(generateDatabricksCode((Array.isArray(apiKeys) && apiKeys[0]?.key) || "YOUR_API_KEY"))}
                      className="mt-2"
                      variant="outline"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Databricks Code
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Code className="h-5 w-5" />
                      <CardTitle>cURL Examples</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-gray-600">
                      Use these cURL commands to test your API integration:
                    </p>
                    <Textarea
                      value={generateCurlCode((Array.isArray(apiKeys) && apiKeys[0]?.key) || "YOUR_API_KEY")}
                      readOnly
                      rows={15}
                      className="font-mono text-sm"
                    />
                    <Button
                      onClick={() => copyToClipboard(generateCurlCode((Array.isArray(apiKeys) && apiKeys[0]?.key) || "YOUR_API_KEY"))}
                      className="mt-2"
                      variant="outline"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy cURL Commands
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Database className="h-5 w-5" />
                      <CardTitle>Power BI Integration</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-gray-600">
                      Use this Power Query M code to connect Power BI to your TPM system:
                    </p>
                    <Textarea
                      value={generatePowerBICode((Array.isArray(apiKeys) && apiKeys[0]?.key) || "YOUR_API_KEY")}
                      readOnly
                      rows={15}
                      className="font-mono text-sm"
                    />
                    <Button
                      onClick={() => copyToClipboard(generatePowerBICode((Array.isArray(apiKeys) && apiKeys[0]?.key) || "YOUR_API_KEY"))}
                      className="mt-2"
                      variant="outline"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Power BI Code
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="endpoints">
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    All endpoints require authentication via the X-API-Key header or Authorization: Bearer token.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4">
                  {[
                    { method: "POST", endpoint: "/api/sales-data", description: "Add sales performance data", required: ["promotionId", "accountId", "productId", "salesDate", "incrementalSales", "roi"] },
                    { method: "POST", endpoint: "/api/accounts", description: "Create new accounts", required: ["name", "type"] },
                    { method: "POST", endpoint: "/api/products", description: "Create new products", required: ["sku", "name"] },
                    { method: "POST", endpoint: "/api/promotions", description: "Create new promotions", required: ["name", "accountId", "startDate", "endDate", "promotionType", "budget"] },
                    { method: "POST", endpoint: "/api/budgets", description: "Create budget allocations", required: ["accountId", "quarter", "allocatedAmount"] },
                    { method: "POST", endpoint: "/api/deductions", description: "Add deduction records", required: ["accountId", "referenceNumber", "amount", "submittedDate", "daysOld"] },
                    { method: "GET", endpoint: "/api/sales-data", description: "Retrieve all sales data", required: [] },
                    { method: "GET", endpoint: "/api/accounts", description: "Retrieve all accounts", required: [] },
                    { method: "GET", endpoint: "/api/promotions", description: "Retrieve all promotions", required: [] },
                  ].map((api, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant={api.method === "POST" ? "default" : "secondary"}>
                              {api.method}
                            </Badge>
                            <code className="font-mono text-sm">{api.endpoint}</code>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{api.description}</p>
                        {api.required.length > 0 && (
                          <div className="text-xs text-gray-500">
                            Required fields: {api.required.join(", ")}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}