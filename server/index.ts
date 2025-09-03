import express from "express";
import { createServer } from "http";
import { setupVite } from "./vite";
import { setupAuth } from "./auth";

import { storage } from "./storage";
import {
  insertPromotionSchema,
  insertAccountSchema,
  insertProductSchema,
  insertBudgetAllocationSchema,
  insertDeductionSchema,
  insertSalesDataSchema,
  insertActivitySchema,
  insertUserSettingsSchema,
  insertApiKeySchema,
} from "@shared/schema";
import { z } from "zod";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

async function main() {
  // Setup authentication
  await setupAuth(app);

  // Add all the API routes here
  setupApiRoutes(app);

  // Create HTTP server
  const server = createServer(app);
  
  // Setup Vite with the server
  await setupVite(app, server);
  
  server.listen(PORT, () => {
    console.log(`[express] serving on port ${PORT}`);
  });
}

// API authentication middleware for external systems
const isApiAuthenticated = async (req: any, res: any, next: any) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return res.status(401).json({ message: 'API key required' });
  }

  try {
    const key = await storage.getApiKeyByKey(apiKey);
    if (!key) {
      return res.status(401).json({ message: 'Invalid API key' });
    }

    // Update last used timestamp
    await storage.updateApiKeyLastUsed(key.id);
    
    // Attach API key info to request
    req.apiKey = key;
    next();
  } catch (error) {
    console.error('API authentication error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
};

function setupApiRoutes(app: express.Express) {
  // Dashboard & Analytics routes
  app.get('/api/dashboard/kpis', async (req, res) => {
    try {
      const kpis = await storage.getKPIData();
      res.json(kpis);
    } catch (error) {
      console.error("Error fetching KPIs:", error);
      res.status(500).json({ message: "Failed to fetch KPI data" });
    }
  });

  // External API endpoints for integrations
  app.get('/api/accounts', isApiAuthenticated, async (req, res) => {
    try {
      const accounts = await storage.getAccounts();
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });

  app.post('/api/accounts', isApiAuthenticated, async (req, res) => {
    try {
      const validatedData = insertAccountSchema.parse(req.body);
      const account = await storage.createAccount(validatedData);
      res.json(account);
    } catch (error) {
      console.error("Error creating account:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.get('/api/products', isApiAuthenticated, async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post('/api/products', isApiAuthenticated, async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.get('/api/promotions', isApiAuthenticated, async (req, res) => {
    try {
      const promotions = await storage.getPromotions();
      res.json(promotions);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      res.status(500).json({ message: "Failed to fetch promotions" });
    }
  });

  app.post('/api/promotions', isApiAuthenticated, async (req: any, res) => {
    try {
      // For API calls, use the API key creator's ID or a default admin ID
      const createdBy = req.apiKey ? req.apiKey.createdBy : req.user?.id || 'system';
      
      const validatedData = insertPromotionSchema.parse({
        ...req.body,
        createdBy: createdBy,
      });
      const promotion = await storage.createPromotion(validatedData);
      res.json(promotion);
    } catch (error) {
      console.error("Error creating promotion:", error);
      res.status(500).json({ message: "Failed to create promotion" });
    }
  });

  app.post('/api/sales-data', isApiAuthenticated, async (req, res) => {
    try {
      const validatedData = insertSalesDataSchema.parse(req.body);
      const salesData = await storage.createSalesData(validatedData);
      res.json(salesData);
    } catch (error) {
      console.error("Error creating sales data:", error);
      res.status(500).json({ message: "Failed to create sales data" });
    }
  });
}

main().catch(console.error);