import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertPromotionSchema,
  insertAccountSchema,
  insertProductSchema,
  insertBudgetAllocationSchema,
  insertDeductionSchema,
  insertSalesDataSchema,
  insertActivitySchema,
  insertUserSettingsSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard & Analytics routes
  app.get('/api/dashboard/kpis', isAuthenticated, async (req, res) => {
    try {
      const kpis = await storage.getKPIData();
      res.json(kpis);
    } catch (error) {
      console.error("Error fetching KPIs:", error);
      res.status(500).json({ message: "Failed to fetch KPI data" });
    }
  });

  app.get('/api/dashboard/roi-trend/:timePeriod?/:viewBy?', isAuthenticated, async (req, res) => {
    try {
      const timePeriod = req.params.timePeriod || 'last-12-months';
      const viewBy = req.params.viewBy || 'months';
      const trendData = await storage.getROITrendData(timePeriod, viewBy);
      res.json(trendData);
    } catch (error) {
      console.error("Error fetching ROI trend:", error);
      res.status(500).json({ message: "Failed to fetch ROI trend data" });
    }
  });

  app.get('/api/dashboard/top-promotions', isAuthenticated, async (req, res) => {
    try {
      const topPromotions = await storage.getTopPerformingPromotions();
      res.json(topPromotions);
    } catch (error) {
      console.error("Error fetching top promotions:", error);
      res.status(500).json({ message: "Failed to fetch top promotions" });
    }
  });

  app.get('/api/dashboard/recent-activities', isAuthenticated, async (req, res) => {
    try {
      const activities = await storage.getRecentActivities(10);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Account routes
  app.get('/api/accounts', isAuthenticated, async (req, res) => {
    try {
      const accounts = await storage.getAccounts();
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });

  app.post('/api/accounts', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertAccountSchema.parse(req.body);
      const account = await storage.createAccount(validatedData);
      res.json(account);
    } catch (error) {
      console.error("Error creating account:", error);
      res.status(400).json({ message: "Failed to create account" });
    }
  });

  // Product routes
  app.get('/api/products', isAuthenticated, async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post('/api/products', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ message: "Failed to create product" });
    }
  });

  // Promotion routes
  app.get('/api/promotions', isAuthenticated, async (req, res) => {
    try {
      const promotions = await storage.getPromotions();
      res.json(promotions);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      res.status(500).json({ message: "Failed to fetch promotions" });
    }
  });

  app.get('/api/promotions/upcoming', isAuthenticated, async (req, res) => {
    try {
      const promotions = await storage.getUpcomingPromotions();
      res.json(promotions);
    } catch (error) {
      console.error("Error fetching upcoming promotions:", error);
      res.status(500).json({ message: "Failed to fetch upcoming promotions" });
    }
  });

  app.get('/api/promotions/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const promotion = await storage.getPromotionById(id);
      if (!promotion) {
        return res.status(404).json({ message: "Promotion not found" });
      }
      res.json(promotion);
    } catch (error) {
      console.error("Error fetching promotion:", error);
      res.status(500).json({ message: "Failed to fetch promotion" });
    }
  });

  app.post('/api/promotions', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertPromotionSchema.parse({
        ...req.body,
        createdBy: req.user.claims.sub,
      });
      const promotion = await storage.createPromotion(validatedData);
      
      // Create activity log
      await storage.createActivity({
        userId: req.user.claims.sub,
        type: 'promotion_created',
        message: `New promotion "${promotion.name}" created`,
        entityType: 'promotion',
        entityId: promotion.id,
      });
      
      res.json(promotion);
    } catch (error) {
      console.error("Error creating promotion:", error);
      res.status(400).json({ message: "Failed to create promotion" });
    }
  });

  app.put('/api/promotions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPromotionSchema.partial().parse(req.body);
      const promotion = await storage.updatePromotion(id, validatedData);
      
      // Create activity log
      await storage.createActivity({
        userId: req.user.claims.sub,
        type: 'promotion_updated',
        message: `Promotion "${promotion.name}" updated`,
        entityType: 'promotion',
        entityId: promotion.id,
      });
      
      res.json(promotion);
    } catch (error) {
      console.error("Error updating promotion:", error);
      res.status(400).json({ message: "Failed to update promotion" });
    }
  });

  // Budget routes
  app.get('/api/budgets', isAuthenticated, async (req, res) => {
    try {
      const budgets = await storage.getBudgetAllocations();
      res.json(budgets);
    } catch (error) {
      console.error("Error fetching budgets:", error);
      res.status(500).json({ message: "Failed to fetch budgets" });
    }
  });

  app.get('/api/budgets/quarter/:quarter', isAuthenticated, async (req, res) => {
    try {
      const quarter = req.params.quarter;
      const budget = await storage.getBudgetByQuarter(quarter);
      res.json(budget);
    } catch (error) {
      console.error("Error fetching quarter budget:", error);
      res.status(500).json({ message: "Failed to fetch quarter budget" });
    }
  });

  app.post('/api/budgets', isAuthenticated, async (req, res) => {
    try {
      const { action, ...data } = req.body;
      const validatedData = insertBudgetAllocationSchema.parse(data);
      
      if (action === 'replace' || action === 'add') {
        const budget = await storage.upsertBudgetAllocation(validatedData, action);
        res.json(budget);
      } else {
        const budget = await storage.createBudgetAllocation(validatedData);
        res.json(budget);
      }
    } catch (error) {
      console.error("Error creating budget:", error);
      res.status(400).json({ message: "Failed to create budget allocation" });
    }
  });

  // Deduction routes
  app.get('/api/deductions', isAuthenticated, async (req, res) => {
    try {
      const deductions = await storage.getDeductions();
      res.json(deductions);
    } catch (error) {
      console.error("Error fetching deductions:", error);
      res.status(500).json({ message: "Failed to fetch deductions" });
    }
  });

  app.get('/api/deductions/priority', isAuthenticated, async (req, res) => {
    try {
      const deductions = await storage.getPriorityDeductions();
      res.json(deductions);
    } catch (error) {
      console.error("Error fetching priority deductions:", error);
      res.status(500).json({ message: "Failed to fetch priority deductions" });
    }
  });

  app.post('/api/deductions', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertDeductionSchema.parse(req.body);
      const deduction = await storage.createDeduction(validatedData);
      res.json(deduction);
    } catch (error) {
      console.error("Error creating deduction:", error);
      res.status(400).json({ message: "Failed to create deduction" });
    }
  });

  app.put('/api/deductions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertDeductionSchema.partial().parse(req.body);
      const deduction = await storage.updateDeduction(id, validatedData);
      
      // Create activity log for status changes
      if (validatedData.status) {
        await storage.createActivity({
          userId: req.user.claims.sub,
          type: 'deduction_updated',
          message: `Deduction ${deduction.referenceNumber} status changed to ${deduction.status}`,
          entityType: 'deduction',
          entityId: deduction.id,
        });
      }
      
      res.json(deduction);
    } catch (error) {
      console.error("Error updating deduction:", error);
      res.status(400).json({ message: "Failed to update deduction" });
    }
  });

  // Sales data routes
  app.get('/api/sales-data', isAuthenticated, async (req, res) => {
    try {
      const salesData = await storage.getSalesData();
      res.json(salesData);
    } catch (error) {
      console.error("Error fetching sales data:", error);
      res.status(500).json({ message: "Failed to fetch sales data" });
    }
  });

  app.post('/api/sales-data', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertSalesDataSchema.parse(req.body);
      const salesData = await storage.createSalesData(validatedData);
      res.json(salesData);
    } catch (error) {
      console.error("Error creating sales data:", error);
      res.status(400).json({ message: "Failed to create sales data" });
    }
  });

  // Admin routes (protected for admin role only)
  const isAdmin = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check for admin role in various formats or specific admin user
      console.log(`Admin check - User ID: ${userId}, User role: ${user?.role}`);
      const isAdminUser = user && (
        user.role?.toLowerCase() === 'admin' || 
        user.role === 'Admin' || 
        user.role === 'admin' || 
        userId === '14792220'  // Specific admin user ID
      );
      
      if (!isAdminUser) {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }
      next();
    } catch (error) {
      console.error("Error checking admin role:", error);
      return res.status(500).json({ message: "Failed to verify admin access" });
    }
  };

  app.get('/api/admin/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/users/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const user = await storage.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post('/api/admin/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userData = req.body;
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.patch('/api/admin/users/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userData = req.body;
      const user = await storage.updateUser(req.params.id, userData);
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete('/api/admin/users/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteUser(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // User settings routes
  app.get('/api/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settings = await storage.getUserSettings(userId);
      
      if (!settings) {
        // Return default settings if none exist
        const defaultSettings = {
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
        };
        return res.json(defaultSettings);
      }
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put('/api/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settingsData = req.body;
      
      const settings = await storage.upsertUserSettings(userId, settingsData);
      res.json(settings);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Update user profile route  
  app.patch('/api/auth/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = req.body;
      
      const user = await storage.updateUser(userId, profileData);
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
