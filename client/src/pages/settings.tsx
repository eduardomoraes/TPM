import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi, type UserSettings as ApiUserSettings } from "@/lib/settingsApi";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Bell, 
  Palette, 
  Shield, 
  Building, 
  Save, 
  RefreshCw,
  Eye,
  EyeOff,
  Settings as SettingsIcon,
  Globe,
  Calendar,
  DollarSign
} from "lucide-react";
import type { User as UserType } from "@shared/schema";

interface UserSettings {
  notifications: {
    emailAlerts: boolean;
    pushNotifications: boolean;
    weeklyReports: boolean;
    budgetAlerts: boolean;
    promotionReminders: boolean;
  };
  preferences: {
    theme: string;
    language: string;
    timezone: string;
    currency: string;
    dateFormat: string;
    defaultDashboardView: string;
    roiDisplayFormat: string;
  };
  dashboard: {
    defaultTimeRange: string;
    showKPICards: boolean;
    showROIChart: boolean;
    showPromotionCalendar: boolean;
    showBudgetOverview: boolean;
    showRecentActivities: boolean;
  };
  business: {
    fiscalYearStart: string;
    defaultPromotionDuration: number;
    budgetApprovalThreshold: number;
    roiTarget: number;
  };
}

export default function Settings() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch user settings
  const { data: settingsData, isLoading: settingsLoading } = useQuery<ApiUserSettings>({
    queryKey: ['/api/settings'],
    queryFn: settingsApi.getSettings,
    enabled: isAuthenticated,
  });

  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      emailAlerts: true,
      pushNotifications: true,
      weeklyReports: true,
      budgetAlerts: true,
      promotionReminders: true,
    },
    preferences: {
      theme: "light",
      language: "en",
      timezone: "America/New_York",
      currency: "USD",
      dateFormat: "MM/DD/YYYY",
      defaultDashboardView: "overview",
      roiDisplayFormat: "percentage",
    },
    dashboard: {
      defaultTimeRange: "last-12-months",
      showKPICards: true,
      showROIChart: true,
      showPromotionCalendar: true,
      showBudgetOverview: true,
      showRecentActivities: true,
    },
    business: {
      fiscalYearStart: "01-01",
      defaultPromotionDuration: 30,
      budgetApprovalThreshold: 10000,
      roiTarget: 150,
    },
  });

  // Update local state when settings data is loaded
  useEffect(() => {
    if (settingsData) {
      setSettings(settingsData);
    }
  }, [settingsData]);

  // Mutations for settings and profile
  const updateSettingsMutation = useMutation({
    mutationFn: settingsApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Settings Saved",
        description: "Your preferences have been successfully saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save settings: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: settingsApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update profile: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "Sales Manager",
    department: "",
    phone: "",
  });

  const isUpdatingSettings = updateSettingsMutation.isPending;
  const isUpdatingProfile = updateProfileMutation.isPending;
  const [showApiKeys, setShowApiKeys] = useState(false);

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

    if (user) {
      // Check if this is the admin user and set appropriate role/department
      const isAdminUser = (user as any).email === "eduardodmoraes@gmail.com";
      setProfileData({
        firstName: (user as any).firstName || "",
        lastName: (user as any).lastName || "",
        email: (user as any).email || "",
        role: isAdminUser ? "Admin" : "Sales Manager",
        department: isAdminUser ? "IT" : (user as any).department || "",
        phone: (user as any).phone || "",
      });
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
      });
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateSettingsMutation.mutateAsync(settings);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const updateSettings = (section: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

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
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Settings</h2>
                <p className="text-sm text-gray-600">Manage your account, preferences, and application settings</p>
              </div>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="profile" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center space-x-2">
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex items-center space-x-2">
                  <Palette className="h-4 w-4" />
                  <span>Preferences</span>
                </TabsTrigger>
                <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                  <SettingsIcon className="h-4 w-4" />
                  <span>Dashboard</span>
                </TabsTrigger>
                <TabsTrigger value="business" className="flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <span>Business</span>
                </TabsTrigger>
              </TabsList>

              {/* Profile Settings */}
              <TabsContent value="profile">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <User className="h-5 w-5" />
                          <span>Profile Information</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              value={profileData.firstName}
                              onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              value={profileData.lastName}
                              onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select value={profileData.role} onValueChange={(value) => setProfileData(prev => ({ ...prev, role: value }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Sales Manager">Sales Manager</SelectItem>
                                <SelectItem value="Finance Analyst">Finance Analyst</SelectItem>
                                <SelectItem value="Trade Development">Trade Development</SelectItem>
                                <SelectItem value="Executive">Executive</SelectItem>
                                <SelectItem value="Admin">Admin (Full Access)</SelectItem>
                              </SelectContent>
                            </Select>
                            {profileData.role === "Admin" && (
                              <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                                Admin role has full access to all features and settings in the TPM platform.
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <Input
                              id="department"
                              value={profileData.department}
                              onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
                              placeholder="e.g., Trade Marketing"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={profileData.phone}
                            onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>

                        <div className="pt-4">
                          <Button onClick={handleSaveProfile} disabled={isUpdatingProfile}>
                            {isUpdatingProfile ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Profile
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle>Profile Picture</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-center">
                          <Avatar className="h-24 w-24">
                            <AvatarImage src={(user as any)?.profileImageUrl} />
                            <AvatarFallback className="text-lg">
                              {(user as any)?.firstName?.[0]}{(user as any)?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="text-center space-y-2">
                          <p className="text-sm text-gray-600">Profile managed by Replit Auth</p>
                          <Badge variant="secondary">Synced</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Notification Settings */}
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bell className="h-5 w-5" />
                      <span>Notification Preferences</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Email Notifications</h4>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Email Alerts</Label>
                            <p className="text-xs text-gray-500">Receive email notifications for important events</p>
                          </div>
                          <Switch
                            checked={settings.notifications.emailAlerts}
                            onCheckedChange={(value) => updateSettings('notifications', 'emailAlerts', value)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Weekly Reports</Label>
                            <p className="text-xs text-gray-500">Weekly summary of promotion performance</p>
                          </div>
                          <Switch
                            checked={settings.notifications.weeklyReports}
                            onCheckedChange={(value) => updateSettings('notifications', 'weeklyReports', value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">App Notifications</h4>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Budget Alerts</Label>
                            <p className="text-xs text-gray-500">Notifications when budgets exceed thresholds</p>
                          </div>
                          <Switch
                            checked={settings.notifications.budgetAlerts}
                            onCheckedChange={(value) => updateSettings('notifications', 'budgetAlerts', value)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Promotion Reminders</Label>
                            <p className="text-xs text-gray-500">Reminders for upcoming promotion deadlines</p>
                          </div>
                          <Switch
                            checked={settings.notifications.promotionReminders}
                            onCheckedChange={(value) => updateSettings('notifications', 'promotionReminders', value)}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="pt-4">
                      <Button onClick={handleSaveSettings} disabled={isUpdatingSettings}>
                        {isUpdatingSettings ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Notifications
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preferences */}
              <TabsContent value="preferences">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Palette className="h-5 w-5" />
                      <span>Display & Regional Preferences</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Theme</Label>
                          <Select 
                            value={settings.preferences.theme} 
                            onValueChange={(value) => updateSettings('preferences', 'theme', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="dark">Dark</SelectItem>
                              <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Language</Label>
                          <Select 
                            value={settings.preferences.language} 
                            onValueChange={(value) => updateSettings('preferences', 'language', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                              <SelectItem value="pt">Portuguese</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Timezone</Label>
                          <Select 
                            value={settings.preferences.timezone} 
                            onValueChange={(value) => updateSettings('preferences', 'timezone', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="America/New_York">Eastern Time</SelectItem>
                              <SelectItem value="America/Chicago">Central Time</SelectItem>
                              <SelectItem value="America/Denver">Mountain Time</SelectItem>
                              <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                              <SelectItem value="UTC">UTC</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Currency</Label>
                          <Select 
                            value={settings.preferences.currency} 
                            onValueChange={(value) => updateSettings('preferences', 'currency', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD ($)</SelectItem>
                              <SelectItem value="EUR">EUR (€)</SelectItem>
                              <SelectItem value="GBP">GBP (£)</SelectItem>
                              <SelectItem value="CAD">CAD (C$)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Date Format</Label>
                          <Select 
                            value={settings.preferences.dateFormat} 
                            onValueChange={(value) => updateSettings('preferences', 'dateFormat', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>ROI Display</Label>
                          <Select 
                            value={settings.preferences.roiDisplayFormat} 
                            onValueChange={(value) => updateSettings('preferences', 'roiDisplayFormat', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">Percentage (%)</SelectItem>
                              <SelectItem value="decimal">Decimal (1.5x)</SelectItem>
                              <SelectItem value="ratio">Ratio (3:2)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="pt-4">
                      <Button onClick={handleSaveSettings} disabled={isUpdatingSettings}>
                        {isUpdatingSettings ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Preferences
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Dashboard Settings */}
              <TabsContent value="dashboard">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <SettingsIcon className="h-5 w-5" />
                      <span>Dashboard Configuration</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Default Settings</h4>
                        
                        <div className="space-y-2">
                          <Label>Default Time Range</Label>
                          <Select 
                            value={settings.dashboard.defaultTimeRange} 
                            onValueChange={(value) => updateSettings('dashboard', 'defaultTimeRange', value)}
                          >
                            <SelectTrigger>
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
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Widget Visibility</h4>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label>KPI Cards</Label>
                            <Switch
                              checked={settings.dashboard.showKPICards}
                              onCheckedChange={(value) => updateSettings('dashboard', 'showKPICards', value)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label>ROI Chart</Label>
                            <Switch
                              checked={settings.dashboard.showROIChart}
                              onCheckedChange={(value) => updateSettings('dashboard', 'showROIChart', value)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label>Promotion Calendar</Label>
                            <Switch
                              checked={settings.dashboard.showPromotionCalendar}
                              onCheckedChange={(value) => updateSettings('dashboard', 'showPromotionCalendar', value)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label>Budget Overview</Label>
                            <Switch
                              checked={settings.dashboard.showBudgetOverview}
                              onCheckedChange={(value) => updateSettings('dashboard', 'showBudgetOverview', value)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label>Recent Activities</Label>
                            <Switch
                              checked={settings.dashboard.showRecentActivities}
                              onCheckedChange={(value) => updateSettings('dashboard', 'showRecentActivities', value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="pt-4">
                      <Button onClick={handleSaveSettings} disabled={isUpdatingSettings}>
                        {isUpdatingSettings ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Dashboard Settings
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Business Settings */}
              <TabsContent value="business">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Building className="h-5 w-5" />
                      <span>Business Configuration</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Fiscal Year Start</Label>
                          <Select 
                            value={settings.business.fiscalYearStart} 
                            onValueChange={(value) => updateSettings('business', 'fiscalYearStart', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="01-01">January 1st</SelectItem>
                              <SelectItem value="04-01">April 1st</SelectItem>
                              <SelectItem value="07-01">July 1st</SelectItem>
                              <SelectItem value="10-01">October 1st</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Default Promotion Duration (days)</Label>
                          <Input
                            type="number"
                            value={settings.business.defaultPromotionDuration}
                            onChange={(e) => updateSettings('business', 'defaultPromotionDuration', parseInt(e.target.value))}
                            min="1"
                            max="365"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Budget Approval Threshold ($)</Label>
                          <Input
                            type="number"
                            value={settings.business.budgetApprovalThreshold}
                            onChange={(e) => updateSettings('business', 'budgetApprovalThreshold', parseInt(e.target.value))}
                            min="0"
                          />
                          <p className="text-xs text-gray-500">Budgets above this amount require additional approval</p>
                        </div>

                        <div className="space-y-2">
                          <Label>ROI Target (%)</Label>
                          <Input
                            type="number"
                            value={settings.business.roiTarget}
                            onChange={(e) => updateSettings('business', 'roiTarget', parseInt(e.target.value))}
                            min="0"
                            max="1000"
                          />
                          <p className="text-xs text-gray-500">Minimum ROI target for promotions</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="pt-4">
                      <Button onClick={handleSaveSettings} disabled={isUpdatingSettings}>
                        {isUpdatingSettings ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Business Settings
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}