import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  date,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("sales_manager"),
  department: varchar("department"),
  phone: varchar("phone"),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User settings table for storing preferences
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  notifications: jsonb("notifications").default({
    emailAlerts: true,
    pushNotifications: true,
    weeklyReports: true,
    budgetAlerts: true,
    promotionReminders: true,
  }),
  preferences: jsonb("preferences").default({
    theme: "light",
    language: "en",
    timezone: "America/New_York",
    currency: "USD",
    dateFormat: "MM/DD/YYYY",
    defaultDashboardView: "overview",
    roiDisplayFormat: "percentage",
  }),
  dashboard: jsonb("dashboard").default({
    defaultTimeRange: "last-12-months",
    showKPICards: true,
    showROIChart: true,
    showPromotionCalendar: true,
    showBudgetOverview: true,
    showRecentActivities: true,
  }),
  business: jsonb("business").default({
    fiscalYearStart: "01-01",
    defaultPromotionDuration: 30,
    budgetApprovalThreshold: 10000,
    roiTarget: 150,
  }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// TPM Core Tables
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'retailer', 'distributor'
  status: varchar("status", { length: 20 }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  brand: varchar("brand", { length: 100 }),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  accountId: integer("account_id").references(() => accounts.id),
  productId: integer("product_id").references(() => products.id),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  promotionType: varchar("promotion_type", { length: 50 }).notNull(), // 'bogo', 'discount', 'coupon'
  discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }),
  budget: decimal("budget", { precision: 12, scale: 2 }).notNull(),
  forecastedVolume: integer("forecasted_volume"),
  actualVolume: integer("actual_volume"),
  status: varchar("status", { length: 20 }).default("planned"), // 'planned', 'active', 'completed', 'cancelled'
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const budgetAllocations = pgTable("budget_allocations", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accounts.id),
  quarter: varchar("quarter", { length: 10 }).notNull(), // 'Q1-2024'
  allocatedAmount: decimal("allocated_amount", { precision: 12, scale: 2 }).notNull(),
  spentAmount: decimal("spent_amount", { precision: 12, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const deductions = pgTable("deductions", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accounts.id),
  promotionId: integer("promotion_id").references(() => promotions.id),
  referenceNumber: varchar("reference_number", { length: 100 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"), // 'pending', 'in_review', 'resolved', 'disputed'
  submittedDate: date("submitted_date").notNull(),
  daysOld: integer("days_old").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const salesData = pgTable("sales_data", {
  id: serial("id").primaryKey(),
  promotionId: integer("promotion_id").references(() => promotions.id),
  accountId: integer("account_id").references(() => accounts.id),
  productId: integer("product_id").references(() => products.id),
  salesDate: date("sales_date").notNull(),
  unitsLift: integer("units_lift"),
  dollarLift: decimal("dollar_lift", { precision: 10, scale: 2 }),
  baselineSales: decimal("baseline_sales", { precision: 10, scale: 2 }),
  incrementalSales: decimal("incremental_sales", { precision: 10, scale: 2 }),
  roi: decimal("roi", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(), // 'promotion_created', 'deduction_validated', etc.
  message: text("message").notNull(),
  entityType: varchar("entity_type", { length: 50 }), // 'promotion', 'deduction', 'budget'
  entityId: integer("entity_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const apiKeys = pgTable("api_keys", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  lastUsed: timestamp("last_used"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  promotions: many(promotions),
  activities: many(activities),
}));

export const accountsRelations = relations(accounts, ({ many }) => ({
  promotions: many(promotions),
  budgetAllocations: many(budgetAllocations),
  deductions: many(deductions),
  salesData: many(salesData),
}));

export const productsRelations = relations(products, ({ many }) => ({
  promotions: many(promotions),
  salesData: many(salesData),
}));

export const promotionsRelations = relations(promotions, ({ one, many }) => ({
  account: one(accounts, {
    fields: [promotions.accountId],
    references: [accounts.id],
  }),
  product: one(products, {
    fields: [promotions.productId],
    references: [products.id],
  }),
  createdByUser: one(users, {
    fields: [promotions.createdBy],
    references: [users.id],
  }),
  deductions: many(deductions),
  salesData: many(salesData),
}));

export const budgetAllocationsRelations = relations(budgetAllocations, ({ one }) => ({
  account: one(accounts, {
    fields: [budgetAllocations.accountId],
    references: [accounts.id],
  }),
}));

export const deductionsRelations = relations(deductions, ({ one }) => ({
  account: one(accounts, {
    fields: [deductions.accountId],
    references: [accounts.id],
  }),
  promotion: one(promotions, {
    fields: [deductions.promotionId],
    references: [promotions.id],
  }),
}));

export const salesDataRelations = relations(salesData, ({ one }) => ({
  promotion: one(promotions, {
    fields: [salesData.promotionId],
    references: [promotions.id],
  }),
  account: one(accounts, {
    fields: [salesData.accountId],
    references: [accounts.id],
  }),
  product: one(products, {
    fields: [salesData.productId],
    references: [products.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertPromotionSchema = createInsertSchema(promotions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBudgetAllocationSchema = createInsertSchema(budgetAllocations).omit({
  id: true,
  createdAt: true,
});

export const insertDeductionSchema = createInsertSchema(deductions).omit({
  id: true,
  createdAt: true,
});

export const insertSalesDataSchema = createInsertSchema(salesData).omit({
  id: true,
  createdAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// User Settings types
export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = typeof userSettings.$inferInsert;

// Relations for user settings
export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));
export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Promotion = typeof promotions.$inferSelect;
export type InsertPromotion = z.infer<typeof insertPromotionSchema>;
export type BudgetAllocation = typeof budgetAllocations.$inferSelect;
export type InsertBudgetAllocation = z.infer<typeof insertBudgetAllocationSchema>;
export type Deduction = typeof deductions.$inferSelect;
export type InsertDeduction = z.infer<typeof insertDeductionSchema>;
export type SalesData = typeof salesData.$inferSelect;
export type InsertSalesData = z.infer<typeof insertSalesDataSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  createdAt: true,
  key: true,
});
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
