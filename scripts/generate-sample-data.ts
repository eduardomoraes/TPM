import { db } from '../server/db';
import {
  accounts,
  products,
  promotions,
  budgetAllocations,
  deductions,
  salesData,
  activities,
  users,
} from '../shared/schema';

async function generateSampleData() {
  console.log('Generating sample data for TPM platform...');

  try {
    // Clear existing data (except users and sessions)
    await db.delete(activities);
    await db.delete(salesData);
    await db.delete(deductions);
    await db.delete(promotions);
    await db.delete(budgetAllocations);
    await db.delete(products);
    await db.delete(accounts);

    console.log('Cleared existing data');

    // Generate Accounts
    const accountData = [
      { name: 'Walmart', type: 'retailer', status: 'active' },
      { name: 'Target', type: 'retailer', status: 'active' },
      { name: 'Kroger', type: 'retailer', status: 'active' },
      { name: 'Costco', type: 'retailer', status: 'active' },
      { name: 'Amazon Fresh', type: 'retailer', status: 'active' },
      { name: 'Whole Foods', type: 'retailer', status: 'active' },
      { name: 'Safeway', type: 'retailer', status: 'active' },
      { name: 'KeHE Distributors', type: 'distributor', status: 'active' },
      { name: 'UNFI', type: 'distributor', status: 'active' },
      { name: 'C&S Wholesale', type: 'distributor', status: 'active' }
    ];

    const createdAccounts = await db.insert(accounts).values(accountData).returning();
    console.log(`Created ${createdAccounts.length} accounts`);

    // Generate Products
    const productData = [
      { sku: 'BEV-001', name: 'Premium Orange Juice 64oz', category: 'Beverages', brand: 'FreshCo', unitCost: '3.49' },
      { sku: 'BEV-002', name: 'Sparkling Water 12-pack', category: 'Beverages', brand: 'PureSpark', unitCost: '4.99' },
      { sku: 'SNK-001', name: 'Organic Granola Bars 8-pack', category: 'Snacks', brand: 'NatureBar', unitCost: '5.99' },
      { sku: 'SNK-002', name: 'Mixed Nuts Premium 16oz', category: 'Snacks', brand: 'NutHouse', unitCost: '8.99' },
      { sku: 'FRZ-001', name: 'Frozen Pizza Supreme', category: 'Frozen', brand: 'TastyBite', unitCost: '6.49' },
      { sku: 'FRZ-002', name: 'Ice Cream Vanilla 1.5qt', category: 'Frozen', brand: 'CreamyDelight', unitCost: '4.99' },
      { sku: 'DRY-001', name: 'Pasta Sauce Marinara 24oz', category: 'Dry Goods', brand: 'Italia', unitCost: '2.99' },
      { sku: 'DRY-002', name: 'Whole Grain Cereal 12oz', category: 'Dry Goods', brand: 'HealthyCrunch', unitCost: '4.49' },
      { sku: 'DRY-003', name: 'Olive Oil Extra Virgin 500ml', category: 'Dry Goods', brand: 'MediterraneanGold', unitCost: '12.99' },
      { sku: 'PER-001', name: 'Organic Shampoo 16oz', category: 'Personal Care', brand: 'NaturalGlow', unitCost: '7.99' }
    ];

    const createdProducts = await db.insert(products).values(productData).returning();
    console.log(`Created ${createdProducts.length} products`);

    // Generate Budget Allocations
    const quarters = ['Q1-2024', 'Q2-2024', 'Q3-2024', 'Q4-2024'];
    const budgetData = [];
    
    for (const account of createdAccounts.slice(0, 6)) { // First 6 accounts get budgets
      for (const quarter of quarters) {
        const baseAmount = Math.floor(Math.random() * 150000) + 50000; // $50k-$200k
        const spentPercentage = quarter === 'Q4-2024' ? 0 : Math.random() * 0.8; // Future quarters have 0 spent
        
        budgetData.push({
          accountId: account.id,
          quarter,
          allocatedAmount: baseAmount.toString(),
          spentAmount: (baseAmount * spentPercentage).toFixed(2)
        });
      }
    }

    const createdBudgets = await db.insert(budgetAllocations).values(budgetData).returning();
    console.log(`Created ${createdBudgets.length} budget allocations`);

    // Get a user ID for creating promotions
    const existingUser = await db.select().from(users).limit(1);
    const userId = existingUser.length > 0 ? existingUser[0].id : null;

    // Generate Promotions
    const promotionTypes = ['bogo', 'discount', 'coupon', 'rebate'];
    const statuses = ['planned', 'active', 'completed'];
    const promotionData = [];

    for (let i = 0; i < 25; i++) {
      const account = createdAccounts[Math.floor(Math.random() * createdAccounts.length)];
      const product = createdProducts[Math.floor(Math.random() * createdProducts.length)];
      const type = promotionTypes[Math.floor(Math.random() * promotionTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Generate realistic dates
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 120) - 60); // ±60 days from now
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 30) + 7); // 7-37 days duration

      const budget = Math.floor(Math.random() * 50000) + 5000; // $5k-$55k
      const forecastedVolume = Math.floor(Math.random() * 10000) + 1000;
      const actualVolume = status === 'completed' ? Math.floor(forecastedVolume * (0.8 + Math.random() * 0.4)) : null;

      promotionData.push({
        name: `${type.toUpperCase()} - ${product.name} at ${account.name}`,
        accountId: account.id,
        productId: product.id,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        promotionType: type,
        discountPercent: type === 'discount' ? (Math.floor(Math.random() * 30) + 10).toString() : null,
        budget: budget.toString(),
        forecastedVolume,
        actualVolume,
        status,
        createdBy: userId
      });
    }

    const createdPromotions = await db.insert(promotions).values(promotionData).returning();
    console.log(`Created ${createdPromotions.length} promotions`);

    // Generate Deductions
    const deductionStatuses = ['pending', 'in_review', 'resolved', 'disputed'];
    const deductionData = [];

    for (let i = 0; i < 30; i++) {
      const account = createdAccounts[Math.floor(Math.random() * createdAccounts.length)];
      const promotion = createdPromotions[Math.floor(Math.random() * createdPromotions.length)];
      const status = deductionStatuses[Math.floor(Math.random() * deductionStatuses.length)];
      
      const submittedDate = new Date();
      submittedDate.setDate(submittedDate.getDate() - Math.floor(Math.random() * 90)); // Within last 90 days
      const daysOld = Math.floor((new Date().getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24));

      deductionData.push({
        accountId: account.id,
        promotionId: promotion.id,
        referenceNumber: `DED-${String(i + 1).padStart(6, '0')}`,
        amount: (Math.random() * 15000 + 1000).toFixed(2), // $1k-$16k
        status,
        submittedDate: submittedDate.toISOString().split('T')[0],
        daysOld,
        description: `Trade deduction for ${promotion.name} promotion`
      });
    }

    const createdDeductions = await db.insert(deductions).values(deductionData).returning();
    console.log(`Created ${createdDeductions.length} deductions`);

    // Generate Sales Data
    const salesDataEntries = [];
    
    for (const promotion of createdPromotions.slice(0, 15)) { // Generate sales data for first 15 promotions
      const startDate = new Date(promotion.startDate);
      const endDate = new Date(promotion.endDate);
      const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Generate daily sales data for the promotion period
      for (let day = 0; day <= daysDiff; day += 3) { // Every 3 days
        const salesDate = new Date(startDate);
        salesDate.setDate(salesDate.getDate() + day);
        
        if (salesDate <= new Date()) { // Only past dates
          const baselineSales = Math.random() * 5000 + 1000;
          const lift = 0.15 + Math.random() * 0.35; // 15-50% lift
          const incrementalSales = baselineSales * lift;
          const totalSales = baselineSales + incrementalSales;
          const roi = (incrementalSales / parseFloat(promotion.budget)) * 100;

          salesDataEntries.push({
            promotionId: promotion.id,
            accountId: promotion.accountId,
            productId: promotion.productId,
            salesDate: salesDate.toISOString().split('T')[0],
            unitsLift: Math.floor(Math.random() * 500 + 100),
            dollarLift: incrementalSales.toFixed(2),
            baselineSales: baselineSales.toFixed(2),
            incrementalSales: incrementalSales.toFixed(2),
            roi: roi.toFixed(2)
          });
        }
      }
    }

    const createdSalesData = await db.insert(salesData).values(salesDataEntries).returning();
    console.log(`Created ${createdSalesData.length} sales data entries`);

    // Generate Activities
    const activityTypes = [
      'promotion_created',
      'promotion_updated',
      'deduction_submitted',
      'deduction_validated',
      'budget_allocated',
      'forecast_updated'
    ];

    const activityData = [];
    
    for (let i = 0; i < 50; i++) {
      const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      const createdAt = new Date();
      createdAt.setHours(createdAt.getHours() - Math.floor(Math.random() * 72)); // Within last 3 days

      let message = '';
      let entityType = '';
      let entityId = null;

      switch (type) {
        case 'promotion_created':
          const promo = createdPromotions[Math.floor(Math.random() * createdPromotions.length)];
          message = `Created promotion "${promo.name}"`;
          entityType = 'promotion';
          entityId = promo.id;
          break;
        case 'promotion_updated':
          const updatePromo = createdPromotions[Math.floor(Math.random() * createdPromotions.length)];
          message = `Updated promotion "${updatePromo.name}" status to ${updatePromo.status}`;
          entityType = 'promotion';
          entityId = updatePromo.id;
          break;
        case 'deduction_submitted':
          const deduction = createdDeductions[Math.floor(Math.random() * createdDeductions.length)];
          message = `New deduction submitted: ${deduction.referenceNumber} for $${deduction.amount}`;
          entityType = 'deduction';
          entityId = deduction.id;
          break;
        case 'deduction_validated':
          const validatedDeduction = createdDeductions[Math.floor(Math.random() * createdDeductions.length)];
          message = `Validated deduction ${validatedDeduction.referenceNumber}`;
          entityType = 'deduction';
          entityId = validatedDeduction.id;
          break;
        case 'budget_allocated':
          const budget = createdBudgets[Math.floor(Math.random() * createdBudgets.length)];
          message = `Allocated $${budget.allocatedAmount} budget for ${budget.quarter}`;
          entityType = 'budget';
          entityId = budget.id;
          break;
        case 'forecast_updated':
          message = `Updated demand forecast for next quarter`;
          entityType = 'forecast';
          break;
      }

      activityData.push({
        userId,
        type,
        message,
        entityType,
        entityId
      });
    }

    const createdActivities = await db.insert(activities).values(activityData).returning();
    console.log(`Created ${createdActivities.length} activities`);

    console.log('\n✅ Sample data generation completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- ${createdAccounts.length} retail accounts and distributors`);
    console.log(`- ${createdProducts.length} products across multiple categories`);
    console.log(`- ${createdBudgets.length} quarterly budget allocations`);
    console.log(`- ${createdPromotions.length} promotions with various types and statuses`);
    console.log(`- ${createdDeductions.length} trade deductions for processing`);
    console.log(`- ${createdSalesData.length} sales performance data points`);
    console.log(`- ${createdActivities.length} recent activities for audit trail`);

  } catch (error) {
    console.error('Error generating sample data:', error);
    throw error;
  }
}

// Run the script
generateSampleData()
  .then(() => {
    console.log('\n🎉 Sample data generation complete! You can now test the TPM platform.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to generate sample data:', error);
    process.exit(1);
  });