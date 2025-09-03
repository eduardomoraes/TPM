import { db } from "../server/db";
import { 
  users, 
  accounts, 
  products, 
  promotions, 
  budgetAllocations, 
  deductions, 
  salesData, 
  activities 
} from "../shared/schema";

async function populateSampleData() {
  try {
    console.log("🌱 Populating database with sample data...");
    
    // Sample accounts
    const sampleAccounts = [
      { name: "Walmart", type: "national_chain", region: "national", contactEmail: "buyer@walmart.com", contactPhone: "+1-555-0101" },
      { name: "Target", type: "national_chain", region: "national", contactEmail: "procurement@target.com", contactPhone: "+1-555-0102" },
      { name: "Kroger", type: "grocery", region: "southeast", contactEmail: "trading@kroger.com", contactPhone: "+1-555-0103" },
      { name: "Costco", type: "club", region: "west", contactEmail: "vendor@costco.com", contactPhone: "+1-555-0104" },
      { name: "Amazon Fresh", type: "online", region: "national", contactEmail: "vendor@amazon.com", contactPhone: "+1-555-0105" }
    ];

    console.log("Adding sample accounts...");
    const insertedAccounts = await db.insert(accounts).values(sampleAccounts).returning();
    console.log(`✅ Created ${insertedAccounts.length} accounts`);

    // Sample products
    const sampleProducts = [
      { name: "Premium Pasta Sauce", sku: "PPS-001", category: "condiments", brand: "GourmetPro", unitCost: 2.50, unitPrice: 4.99 },
      { name: "Organic Whole Wheat Bread", sku: "OWB-002", category: "bakery", brand: "NatureBest", unitCost: 1.20, unitPrice: 3.49 },
      { name: "Greek Yogurt 32oz", sku: "GY-003", category: "dairy", brand: "CreamyChoice", unitCost: 3.00, unitPrice: 5.99 },
      { name: "Artisan Cheese Blend", sku: "ACB-004", category: "dairy", brand: "FarmFresh", unitCost: 4.50, unitPrice: 8.99 },
      { name: "Cold Brew Coffee 64oz", sku: "CBC-005", category: "beverages", brand: "BeanCraft", unitCost: 2.80, unitPrice: 6.49 }
    ];

    console.log("Adding sample products...");
    const insertedProducts = await db.insert(products).values(sampleProducts).returning();
    console.log(`✅ Created ${insertedProducts.length} products`);

    // Sample promotions
    const samplePromotions = [
      {
        name: "Back to School Pasta Promotion",
        accountId: insertedAccounts[0].id,
        productId: insertedProducts[0].id,
        promotionType: "discount",
        startDate: new Date("2024-08-01"),
        endDate: new Date("2024-09-15"),
        budget: 75000,
        forecastedVolume: 95000,
        status: "completed",
        description: "15% off premium pasta sauce for back-to-school season",
        createdBy: null
      },
      {
        name: "Organic Bread Launch",
        accountId: insertedAccounts[1].id,
        productId: insertedProducts[1].id,
        promotionType: "bogo",
        startDate: new Date("2024-09-01"),
        endDate: new Date("2024-10-31"),
        budget: 45000,
        forecastedVolume: 52000,
        status: "active",
        description: "Buy one get one 50% off organic whole wheat bread",
        createdBy: null
      },
      {
        name: "Holiday Cheese & Yogurt Bundle",
        accountId: insertedAccounts[2].id,
        productId: insertedProducts[2].id,
        promotionType: "bundle",
        startDate: new Date("2024-11-15"),
        endDate: new Date("2024-12-31"),
        budget: 120000,
        forecastedVolume: 140000,
        status: "planned",
        description: "Special holiday bundle pricing for dairy products",
        createdBy: null
      },
      {
        name: "Coffee Lovers Special",
        accountId: insertedAccounts[4].id,
        productId: insertedProducts[4].id,
        promotionType: "discount",
        startDate: new Date("2024-10-01"),
        endDate: new Date("2024-11-30"),
        budget: 35000,
        forecastedVolume: 41000,
        status: "active",
        description: "20% off cold brew coffee for fall season",
        createdBy: null
      },
      {
        name: "Premium Artisan Cheese Showcase",
        accountId: insertedAccounts[3].id,
        productId: insertedProducts[3].id,
        promotionType: "display",
        startDate: new Date("2024-12-01"),
        endDate: new Date("2025-01-15"),
        budget: 85000,
        forecastedVolume: 98000,
        status: "planned",
        description: "End cap display promotion for artisan cheese blend",
        createdBy: null
      }
    ];

    console.log("Adding sample promotions...");
    const insertedPromotions = await db.insert(promotions).values(samplePromotions).returning();
    console.log(`✅ Created ${insertedPromotions.length} promotions`);

    // Sample budget allocations
    const sampleBudgets = [
      { accountId: insertedAccounts[0].id, quarter: "Q4-2024", allocatedAmount: 250000, spentAmount: 165000 },
      { accountId: insertedAccounts[1].id, quarter: "Q4-2024", allocatedAmount: 180000, spentAmount: 95000 },
      { accountId: insertedAccounts[2].id, quarter: "Q4-2024", allocatedAmount: 320000, spentAmount: 180000 },
      { accountId: insertedAccounts[3].id, quarter: "Q4-2024", allocatedAmount: 150000, spentAmount: 65000 },
      { accountId: insertedAccounts[4].id, quarter: "Q4-2024", allocatedAmount: 220000, spentAmount: 125000 }
    ];

    console.log("Adding sample budget allocations...");
    const insertedBudgets = await db.insert(budgetAllocations).values(sampleBudgets).returning();
    console.log(`✅ Created ${insertedBudgets.length} budget allocations`);

    // Sample deductions
    const sampleDeductions = [
      {
        accountId: insertedAccounts[0].id,
        promotionId: insertedPromotions[0].id,
        referenceNumber: "PA-001-2024",
        amount: 12500,
        status: "resolved",
        submittedDate: new Date("2024-08-15"),
        daysOld: 19,
        description: "Back to school pasta promotion settlement"
      },
      {
        accountId: insertedAccounts[1].id,
        promotionId: insertedPromotions[1].id,
        referenceNumber: "PA-002-2024",
        amount: 8750,
        status: "pending",
        submittedDate: new Date("2024-09-20"),
        daysOld: 14,
        description: "Organic bread BOGO promotion claim"
      },
      {
        accountId: insertedAccounts[2].id,
        promotionId: null,
        referenceNumber: "FA-003-2024",
        amount: 15000,
        status: "in_review",
        submittedDate: new Date("2024-08-01"),
        daysOld: 33,
        description: "Q3 freight cost adjustment"
      },
      {
        accountId: insertedAccounts[4].id,
        promotionId: insertedPromotions[3].id,
        referenceNumber: "PA-004-2024",
        amount: 6200,
        status: "pending",
        submittedDate: new Date("2024-09-15"),
        daysOld: 19,
        description: "Coffee promotion early performance bonus"
      }
    ];

    console.log("Adding sample deductions...");
    const insertedDeductions = await db.insert(deductions).values(sampleDeductions).returning();
    console.log(`✅ Created ${insertedDeductions.length} deductions`);

    // Sample sales data
    const sampleSalesData = [
      {
        promotionId: insertedPromotions[0].id,
        accountId: insertedAccounts[0].id,
        productId: insertedProducts[0].id,
        salesDate: new Date("2024-09-01"),
        unitsLift: 1700,
        dollarLift: 8458,
        baselineSales: 12500,
        incrementalSales: 8458,
        roi: 5.2
      },
      {
        promotionId: insertedPromotions[1].id,
        accountId: insertedAccounts[1].id,
        productId: insertedProducts[1].id,
        salesDate: new Date("2024-10-01"),
        unitsLift: 1400,
        dollarLift: 4888,
        baselineSales: 6280,
        incrementalSales: 4888,
        roi: 3.8
      },
      {
        promotionId: insertedPromotions[3].id,
        accountId: insertedAccounts[4].id,
        productId: insertedProducts[4].id,
        salesDate: new Date("2024-10-15"),
        unitsLift: 700,
        dollarLift: 4542,
        baselineSales: 6166.5,
        incrementalSales: 4542,
        roi: 4.1
      }
    ];

    console.log("Adding sample sales data...");
    const insertedSalesData = await db.insert(salesData).values(sampleSalesData).returning();
    console.log(`✅ Created ${insertedSalesData.length} sales records`);

    // Sample activities
    const sampleActivities = [
      {
        userId: null,
        type: "promotion_created",
        message: "Created new promotion: Back to School Pasta Promotion",
        entityType: "promotion",
        entityId: insertedPromotions[0].id
      },
      {
        userId: null,
        type: "promotion_completed",
        message: "Completed promotion: Back to School Pasta Promotion with 5.2x ROI",
        entityType: "promotion",
        entityId: insertedPromotions[0].id
      },
      {
        userId: null,
        type: "deduction_updated",
        message: "Updated deduction status for Walmart promotional allowance to resolved",
        entityType: "deduction",
        entityId: insertedDeductions[0].id
      },
      {
        userId: null,
        type: "forecast_updated",
        message: "Updated forecast for Coffee Lovers Special promotion",
        entityType: "promotion",
        entityId: insertedPromotions[3].id
      },
      {
        userId: null,
        type: "promotion_created",
        message: "Created new promotion: Organic Bread Launch with Target",
        entityType: "promotion",
        entityId: insertedPromotions[1].id
      }
    ];

    console.log("Adding sample activities...");
    const insertedActivities = await db.insert(activities).values(sampleActivities).returning();
    console.log(`✅ Created ${insertedActivities.length} activities`);

    console.log("🎉 Sample data population complete!");
    console.log(`
📊 Summary:
- Accounts: ${insertedAccounts.length}
- Products: ${insertedProducts.length}  
- Promotions: ${insertedPromotions.length}
- Budget Allocations: ${insertedBudgets.length}
- Deductions: ${insertedDeductions.length}
- Sales Records: ${insertedSalesData.length}
- Activities: ${insertedActivities.length}
`);

  } catch (error) {
    console.error("❌ Error populating sample data:", error);
  }
}

// Run the function
populateSampleData().then(() => process.exit(0));