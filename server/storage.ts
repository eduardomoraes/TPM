import {
  users,
  accounts,
  products,
  promotions,
  budgetAllocations,
  deductions,
  salesData,
  activities,
  type User,
  type UpsertUser,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sum, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

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
  getROITrendData(timePeriod?: string): Promise<{ month: string; roi: number }[]>;
  getTopPerformingPromotions(): Promise<(Promotion & { account: Account | null; roi: number; salesLift: number })[]>;
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

  async getROITrendData(timePeriod: string = 'last-12-months'): Promise<{ month: string; roi: number }[]> {
    let dateFilter;
    const now = new Date();
    
    switch (timePeriod) {
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

    const result = await db
      .select({
        month: sql<string>`TO_CHAR(${salesData.salesDate}, 'Mon')`,
        roi: sql<number>`AVG(${salesData.roi})`,
      })
      .from(salesData)
      .where(sql`${salesData.roi} IS NOT NULL AND ${dateFilter}`)
      .groupBy(sql`EXTRACT(MONTH FROM ${salesData.salesDate}), TO_CHAR(${salesData.salesDate}, 'Mon')`)
      .orderBy(sql`EXTRACT(MONTH FROM ${salesData.salesDate})`);

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
}

export const storage = new DatabaseStorage();
