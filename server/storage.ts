import {
  users,
  userSettings,
  accounts,
  products,
  promotions,
  budgetAllocations,
  deductions,
  salesData,
  activities,
  apiKeys,
  type User,
  type UpsertUser,
  type UserSettings,
  type InsertUserSettings,
  type Account,
  type InsertAccount,
  type Product,
  type InsertProduct,
  type Promotion,
  type InsertPromotion,
  type BudgetAllocation,
  type InsertBudgetAllocation,
  type Deduction,
  type InsertDeduction,
  type SalesData,
  type InsertSalesData,
  type Activity,
  type InsertActivity,
  type ApiKey,
  type InsertApiKey,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sum, count, sql } from "drizzle-orm";

// Safe user type for public API (masks sensitive data)
export interface SafeUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  department: string | null;
  phone: string | null;
  isActive: boolean | null;
  lastLogin: Date | null;
  createdAt: Date | null;
  maskedEmail: string; // Only shows first 2 chars + masked middle + domain
}

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Admin user management operations
  getAllUsers(): Promise<SafeUser[]>;
  getUserById(id: string): Promise<User | undefined>;
  createUser(user: Partial<UpsertUser>): Promise<User>;
  updateUser(id: string, user: Partial<UpsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  updateUserLastLogin(id: string): Promise<void>;
  
  // User settings operations
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  upsertUserSettings(userId: string, settings: Partial<InsertUserSettings>): Promise<UserSettings>;

  // Account operations
  getAccounts(): Promise<Account[]>;
  createAccount(account: InsertAccount): Promise<Account>;

  // Product operations
  getProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;

  // Promotion operations
  getPromotions(): Promise<(Promotion & { account: Account | null; product: Product | null })[]>;
  getPromotionById(id: number): Promise<Promotion | undefined>;
  createPromotion(promotion: InsertPromotion): Promise<Promotion>;
  updatePromotion(id: number, promotion: Partial<InsertPromotion>): Promise<Promotion>;
  getActivePromotions(): Promise<Promotion[]>;
  getUpcomingPromotions(): Promise<(Promotion & { account: Account | null })[]>;

  // Budget operations
  getBudgetAllocations(): Promise<(BudgetAllocation & { account: Account | null })[]>;
  createBudgetAllocation(allocation: InsertBudgetAllocation): Promise<BudgetAllocation>;
  upsertBudgetAllocation(allocation: InsertBudgetAllocation, action: 'replace' | 'add'): Promise<BudgetAllocation>;
  getBudgetByQuarter(quarter: string): Promise<{ total: number; spent: number }>;

  // Deduction operations
  getDeductions(): Promise<(Deduction & { account: Account | null; promotion: Promotion | null })[]>;
  createDeduction(deduction: InsertDeduction): Promise<Deduction>;
  updateDeduction(id: number, deduction: Partial<InsertDeduction>): Promise<Deduction>;
  getPriorityDeductions(): Promise<(Deduction & { account: Account | null })[]>;

  // Sales data operations
  getSalesData(): Promise<(SalesData & { promotion: Promotion | null; account: Account | null; product: Product | null })[]>;
  createSalesData(salesData: InsertSalesData): Promise<SalesData>;

  // Activity operations
  getRecentActivities(limit?: number): Promise<(Activity & { user: User | null })[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Analytics operations
  getKPIData(): Promise<{
    tradeSpendYTD: number;
    averageROI: number;
    activePromotions: number;
    pendingDeductions: number;
  }>;
  getROITrendData(timePeriod?: string, viewBy?: string): Promise<{ month: string; roi: number }[]>;
  getTopPerformingPromotions(): Promise<(Promotion & { account: Account | null; roi: number; salesLift: number })[]>;
}

// Utility function to mask emails for security
function maskEmail(email: string | null): string {
  if (!email) return 'N/A';
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return 'N/A';
  
  if (localPart.length <= 2) {
    return `${localPart}***@${domain}`;
  }
  
  const firstTwo = localPart.substring(0, 2);
  const lastOne = localPart.substring(localPart.length - 1);
  const maskedPart = '*'.repeat(Math.max(localPart.length - 3, 1));
  return `${firstTwo}${maskedPart}${lastOne}@${domain}`;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Admin user management operations
  async getAllUsers(): Promise<SafeUser[]> {
    const allUsers = await db.select().from(users).orderBy(users.createdAt);
    return allUsers.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      department: user.department,
      phone: user.phone,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      maskedEmail: maskEmail(user.email),
    }));
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(user: Partial<UpsertUser>): Promise<User> {
    const [newUser] = await db.insert(users).values({
      ...user,
      isActive: user.isActive ?? true,
    } as UpsertUser).returning();
    return newUser;
  }

  async updateUser(id: string, userData: Partial<UpsertUser>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async updateUserLastLogin(id: string): Promise<void> {
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, id));
  }

  // User settings operations
  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));
    return settings;
  }

  async upsertUserSettings(userId: string, settingsData: Partial<InsertUserSettings>): Promise<UserSettings> {
    const [settings] = await db
      .insert(userSettings)
      .values({ ...settingsData, userId } as InsertUserSettings)
      .onConflictDoUpdate({
        target: userSettings.userId,
        set: settingsData,
      })
      .returning();
    return settings;
  }

  // Account operations
  async getAccounts(): Promise<Account[]> {
    return await db.select().from(accounts).orderBy(accounts.name);
  }

  async createAccount(account: InsertAccount): Promise<Account> {
    const [newAccount] = await db.insert(accounts).values(account).returning();
    return newAccount;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(products.name);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  // Promotion operations
  async getPromotions(): Promise<(Promotion & { account: Account | null; product: Product | null })[]> {
    return await db
      .select()
      .from(promotions)
      .leftJoin(accounts, eq(promotions.accountId, accounts.id))
      .leftJoin(products, eq(promotions.productId, products.id))
      .orderBy(desc(promotions.createdAt))
      .then(rows => rows.map(row => ({
        ...row.promotions,
        account: row.accounts,
        product: row.products,
      })));
  }

  async getPromotionById(id: number): Promise<Promotion | undefined> {
    const [promotion] = await db.select().from(promotions).where(eq(promotions.id, id));
    return promotion;
  }

  async createPromotion(promotion: InsertPromotion): Promise<Promotion> {
    const [newPromotion] = await db.insert(promotions).values(promotion).returning();
    return newPromotion;
  }

  async updatePromotion(id: number, promotion: Partial<InsertPromotion>): Promise<Promotion> {
    const [updatedPromotion] = await db
      .update(promotions)
      .set({ ...promotion, updatedAt: new Date() })
      .where(eq(promotions.id, id))
      .returning();
    return updatedPromotion;
  }

  async getActivePromotions(): Promise<Promotion[]> {
    const today = new Date().toISOString().split('T')[0];
    return await db
      .select()
      .from(promotions)
      .where(
        and(
          eq(promotions.status, 'active'),
          lte(promotions.startDate, today),
          gte(promotions.endDate, today)
        )
      );
  }

  async getUpcomingPromotions(): Promise<(Promotion & { account: Account | null })[]> {
    const today = new Date().toISOString().split('T')[0];
    return await db
      .select()
      .from(promotions)
      .leftJoin(accounts, eq(promotions.accountId, accounts.id))
      .where(
        and(
          gte(promotions.startDate, today),
          eq(promotions.status, 'planned')
        )
      )
      .orderBy(promotions.startDate)
      .then(rows => rows.map(row => ({
        ...row.promotions,
        account: row.accounts,
      })));
  }

  // Budget operations
  async getBudgetAllocations(): Promise<(BudgetAllocation & { account: Account | null })[]> {
    return await db
      .select()
      .from(budgetAllocations)
      .leftJoin(accounts, eq(budgetAllocations.accountId, accounts.id))
      .orderBy(budgetAllocations.quarter)
      .then(rows => rows.map(row => ({
        ...row.budget_allocations,
        account: row.accounts,
      })));
  }

  async createBudgetAllocation(allocation: InsertBudgetAllocation): Promise<BudgetAllocation> {
    const [newAllocation] = await db.insert(budgetAllocations).values(allocation).returning();
    return newAllocation;
  }

  async upsertBudgetAllocation(allocation: InsertBudgetAllocation, action: 'replace' | 'add'): Promise<BudgetAllocation> {
    // Find existing budget allocation
    const [existingBudget] = await db
      .select()
      .from(budgetAllocations)
      .where(
        and(
          eq(budgetAllocations.accountId, allocation.accountId!),
          eq(budgetAllocations.quarter, allocation.quarter)
        )
      );

    if (existingBudget) {
      let newAmount: string;
      
      if (action === 'add') {
        // Add to existing amount
        const currentAmount = Number(existingBudget.allocatedAmount);
        const addAmount = Number(allocation.allocatedAmount);
        newAmount = (currentAmount + addAmount).toString();
      } else {
        // Replace existing amount
        newAmount = allocation.allocatedAmount;
      }

      const [updatedAllocation] = await db
        .update(budgetAllocations)
        .set({
          allocatedAmount: newAmount,
        })
        .where(eq(budgetAllocations.id, existingBudget.id))
        .returning();
      
      return updatedAllocation;
    } else {
      // Create new allocation if none exists
      return this.createBudgetAllocation(allocation);
    }
  }

  async getBudgetByQuarter(quarter: string): Promise<{ total: number; spent: number }> {
    const [result] = await db
      .select({
        total: sum(budgetAllocations.allocatedAmount),
        spent: sum(budgetAllocations.spentAmount),
      })
      .from(budgetAllocations)
      .where(eq(budgetAllocations.quarter, quarter));
    
    return {
      total: Number(result?.total || 0),
      spent: Number(result?.spent || 0),
    };
  }

  // Deduction operations
  async getDeductions(): Promise<(Deduction & { account: Account | null; promotion: Promotion | null })[]> {
    return await db
      .select()
      .from(deductions)
      .leftJoin(accounts, eq(deductions.accountId, accounts.id))
      .leftJoin(promotions, eq(deductions.promotionId, promotions.id))
      .orderBy(desc(deductions.submittedDate))
      .then(rows => rows.map(row => ({
        ...row.deductions,
        account: row.accounts,
        promotion: row.promotions,
      })));
  }

  async createDeduction(deduction: InsertDeduction): Promise<Deduction> {
    const [newDeduction] = await db.insert(deductions).values(deduction).returning();
    return newDeduction;
  }

  async updateDeduction(id: number, deduction: Partial<InsertDeduction>): Promise<Deduction> {
    const [updatedDeduction] = await db
      .update(deductions)
      .set(deduction)
      .where(eq(deductions.id, id))
      .returning();
    return updatedDeduction;
  }

  async getPriorityDeductions(): Promise<(Deduction & { account: Account | null })[]> {
    return await db
      .select()
      .from(deductions)
      .leftJoin(accounts, eq(deductions.accountId, accounts.id))
      .where(eq(deductions.status, 'pending'))
      .orderBy(desc(deductions.daysOld))
      .limit(10)
      .then(rows => rows.map(row => ({
        ...row.deductions,
        account: row.accounts,
      })));
  }

  // Sales data operations
  async getSalesData(): Promise<(SalesData & { promotion: Promotion | null; account: Account | null; product: Product | null })[]> {
    return await db
      .select()
      .from(salesData)
      .leftJoin(promotions, eq(salesData.promotionId, promotions.id))
      .leftJoin(accounts, eq(salesData.accountId, accounts.id))
      .leftJoin(products, eq(salesData.productId, products.id))
      .orderBy(desc(salesData.salesDate))
      .then(rows => rows.map(row => ({
        ...row.sales_data,
        promotion: row.promotions,
        account: row.accounts,
        product: row.products,
      })));
  }

  async createSalesData(salesDataInput: InsertSalesData): Promise<SalesData> {
    const [newSalesData] = await db.insert(salesData).values(salesDataInput).returning();
    return newSalesData;
  }

  // Activity operations
  async getRecentActivities(limit: number = 20): Promise<(Activity & { user: User | null })[]> {
    return await db
      .select()
      .from(activities)
      .leftJoin(users, eq(activities.userId, users.id))
      .orderBy(desc(activities.createdAt))
      .limit(limit)
      .then(rows => rows.map(row => ({
        ...row.activities,
        user: row.users,
      })));
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }

  // Analytics operations
  async getKPIData(): Promise<{
    tradeSpendYTD: number;
    averageROI: number;
    activePromotions: number;
    pendingDeductions: number;
  }> {
    const currentYear = new Date().getFullYear();
    
    // Get trade spend YTD
    const [spendResult] = await db
      .select({ total: sum(promotions.budget) })
      .from(promotions)
      .where(sql`EXTRACT(YEAR FROM ${promotions.createdAt}) = ${currentYear}`);

    // Get average ROI
    const [roiResult] = await db
      .select({ avgRoi: sql<number>`AVG(${salesData.roi})` })
      .from(salesData)
      .where(sql`${salesData.roi} IS NOT NULL`);

    // Get active promotions count
    const [activeCount] = await db
      .select({ count: count() })
      .from(promotions)
      .where(eq(promotions.status, 'active'));

    // Get pending deductions amount
    const [pendingDeductionsResult] = await db
      .select({ total: sum(deductions.amount) })
      .from(deductions)
      .where(eq(deductions.status, 'pending'));

    return {
      tradeSpendYTD: Number(spendResult?.total || 0),
      averageROI: Number(roiResult?.avgRoi || 0),
      activePromotions: Number(activeCount?.count || 0),
      pendingDeductions: Number(pendingDeductionsResult?.total || 0),
    };
  }

  async getROITrendData(timePeriod: string = 'last-12-months', viewBy: string = 'months'): Promise<{ month: string; roi: number }[]> {
    let dateFilter;
    const now = new Date();
    
    switch (timePeriod) {
      case 'last-month':
        const lastMonthStart = new Date();
        lastMonthStart.setMonth(now.getMonth() - 1);
        dateFilter = sql`${salesData.salesDate} >= ${lastMonthStart.toISOString().split('T')[0]}`;
        break;
      case 'last-3-months':
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        dateFilter = sql`${salesData.salesDate} >= ${threeMonthsAgo.toISOString().split('T')[0]}`;
        break;
      case 'last-6-months':
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        dateFilter = sql`${salesData.salesDate} >= ${sixMonthsAgo.toISOString().split('T')[0]}`;
        break;
      case 'ytd':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        dateFilter = sql`${salesData.salesDate} >= ${yearStart.toISOString().split('T')[0]}`;
        break;
      case 'last-12-months':
      default:
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(now.getMonth() - 12);
        dateFilter = sql`${salesData.salesDate} >= ${twelveMonthsAgo.toISOString().split('T')[0]}`;
        break;
    }

    let groupByClause, selectClause, orderByClause;
    
    if (viewBy === 'weeks') {
      // Group by week
      selectClause = {
        month: sql<string>`'Week ' || EXTRACT(WEEK FROM ${salesData.salesDate})::text`,
        roi: sql<number>`AVG(${salesData.roi})`,
      };
      groupByClause = sql`EXTRACT(WEEK FROM ${salesData.salesDate}), EXTRACT(YEAR FROM ${salesData.salesDate})`;
      orderByClause = sql`EXTRACT(YEAR FROM ${salesData.salesDate}), EXTRACT(WEEK FROM ${salesData.salesDate})`;
    } else {
      // Group by month (default)
      selectClause = {
        month: sql<string>`TO_CHAR(${salesData.salesDate}, 'Mon')`,
        roi: sql<number>`AVG(${salesData.roi})`,
      };
      groupByClause = sql`EXTRACT(MONTH FROM ${salesData.salesDate}), EXTRACT(YEAR FROM ${salesData.salesDate}), TO_CHAR(${salesData.salesDate}, 'Mon')`;
      orderByClause = sql`EXTRACT(YEAR FROM ${salesData.salesDate}), EXTRACT(MONTH FROM ${salesData.salesDate})`;
    }

    const result = await db
      .select(selectClause)
      .from(salesData)
      .where(sql`${salesData.roi} IS NOT NULL AND ${dateFilter}`)
      .groupBy(groupByClause)
      .orderBy(orderByClause);

    return result.map(row => ({
      month: row.month,
      roi: Number(row.roi || 0),
    }));
  }

  async getTopPerformingPromotions(): Promise<(Promotion & { account: Account | null; roi: number; salesLift: number })[]> {
    const result = await db
      .select({
        promotion: promotions,
        account: accounts,
        roi: sql<number>`AVG(${salesData.roi})`,
        salesLift: sql<number>`AVG(${salesData.unitsLift})`,
      })
      .from(promotions)
      .leftJoin(accounts, eq(promotions.accountId, accounts.id))
      .leftJoin(salesData, eq(promotions.id, salesData.promotionId))
      .where(sql`${salesData.roi} IS NOT NULL`)
      .groupBy(promotions.id, accounts.id)
      .orderBy(sql`AVG(${salesData.roi}) DESC`)
      .limit(5);

    return result.map(row => ({
      ...row.promotion,
      account: row.account,
      roi: Number(row.roi || 0),
      salesLift: Number(row.salesLift || 0),
    }));
  }

  // API Key operations
  async getApiKeys(): Promise<ApiKey[]> {
    return await db.select().from(apiKeys).orderBy(desc(apiKeys.createdAt));
  }

  async createApiKey(apiKeyInput: InsertApiKey, createdBy: string): Promise<ApiKey> {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
    const key = 'tpm_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 15);
    
    const [newApiKey] = await db.insert(apiKeys).values({
      ...apiKeyInput,
      id,
      key,
      createdBy,
    }).returning();
    return newApiKey;
  }

  async deleteApiKey(keyId: string): Promise<boolean> {
    const result = await db.delete(apiKeys).where(eq(apiKeys.id, keyId));
    return (result.rowCount || 0) > 0;
  }

  async validateApiKey(key: string): Promise<ApiKey | null> {
    console.log("Validating API key:", key);
    const [apiKey] = await db.select().from(apiKeys)
      .where(and(eq(apiKeys.key, key), eq(apiKeys.isActive, true)))
      .limit(1);
    
    console.log("Found API key:", apiKey ? apiKey.name : "None");
    
    if (apiKey) {
      // Update last used timestamp
      await db.update(apiKeys)
        .set({ lastUsed: new Date() })
        .where(eq(apiKeys.id, apiKey.id));
    }
    
    return apiKey || null;
  }
}

export const storage = new DatabaseStorage();
