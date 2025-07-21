import { apiRequest } from "./queryClient";

export interface NotificationSettings {
  emailAlerts: boolean;
  pushNotifications: boolean;
  weeklyReports: boolean;
  budgetAlerts: boolean;
  promotionReminders: boolean;
}

export interface PreferencesSettings {
  theme: string;
  language: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  defaultDashboardView: string;
  roiDisplayFormat: string;
}

export interface DashboardSettings {
  defaultTimeRange: string;
  showKPICards: boolean;
  showROIChart: boolean;
  showPromotionCalendar: boolean;
  showBudgetOverview: boolean;
  showRecentActivities: boolean;
}

export interface BusinessSettings {
  fiscalYearStart: string;
  defaultPromotionDuration: number;
  budgetApprovalThreshold: number;
  roiTarget: number;
}

export interface UserSettings {
  id?: number;
  userId?: string;
  notifications: NotificationSettings;
  preferences: PreferencesSettings;
  dashboard: DashboardSettings;
  business: BusinessSettings;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

// Settings API functions
export const settingsApi = {
  // Get user settings
  getSettings: async (): Promise<UserSettings> => {
    const res = await apiRequest('GET', '/api/settings');
    return await res.json();
  },

  // Update user settings
  updateSettings: async (settings: Partial<UserSettings>): Promise<UserSettings> => {
    const res = await apiRequest('PUT', '/api/settings', settings);
    return await res.json();
  },

  // Update user profile
  updateProfile: async (profileData: UpdateProfileData): Promise<any> => {
    const res = await apiRequest('PATCH', '/api/auth/profile', profileData);
    return await res.json();
  },
};