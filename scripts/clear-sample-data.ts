import { db } from "../server/db";
import { 
  activities,
  salesData, 
  deductions, 
  budgetAllocations, 
  promotions, 
  products, 
  accounts 
} from "../shared/schema";

async function clearSampleData() {
  try {
    console.log("🧹 Clearing existing sample data...");
    
    // Delete in reverse order due to foreign key constraints
    console.log("Clearing activities...");
    await db.delete(activities);
    
    console.log("Clearing sales data...");
    await db.delete(salesData);
    
    console.log("Clearing deductions...");
    await db.delete(deductions);
    
    console.log("Clearing budget allocations...");
    await db.delete(budgetAllocations);
    
    console.log("Clearing promotions...");
    await db.delete(promotions);
    
    console.log("Clearing products...");
    await db.delete(products);
    
    console.log("Clearing accounts...");
    await db.delete(accounts);
    
    console.log("✅ All sample data cleared successfully!");
    
  } catch (error) {
    console.error("❌ Error clearing sample data:", error);
  }
}

// Run the function
clearSampleData().then(() => process.exit(0));