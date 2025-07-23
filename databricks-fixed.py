import requests
import json

# Configuration
BASE_URL = "https://bb43520f-8ef1-4b15-a75b-538724300d5c-00-6u6cx2ze6vkw.picard.replit.dev"
API_KEY = "tpm_mdesdyap_rjb79frtixe"

headers = {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY
}

def safe_api_call(url, data, operation_name):
    """Make API call with proper error handling"""
    try:
        response = requests.post(url, headers=headers, json=data)
        print(f"{operation_name} - Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ {operation_name} successful: ID = {result['id']}")
            return result
        else:
            print(f"❌ {operation_name} failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ {operation_name} error: {str(e)}")
        return None

def create_complete_sales_record():
    """Create a complete sales record with all dependencies"""
    
    # Step 1: Create account (with unique name)
    import time
    timestamp = int(time.time())
    
    account_data = {
        "name": f"Target Corp {timestamp}",  # Make it unique
        "type": "retailer",
        "status": "active"
    }
    account = safe_api_call(f"{BASE_URL}/api/accounts", account_data, "Create Account")
    if not account:
        return False
    
    # Step 2: Create product (with unique SKU)
    product_data = {
        "sku": f"PROD-{timestamp}",  # Make it unique
        "name": f"Premium Widget {timestamp}",
        "category": "Electronics"
    }
    product = safe_api_call(f"{BASE_URL}/api/products", product_data, "Create Product")
    if not product:
        return False
    
    # Step 3: Create promotion
    promotion_data = {
        "name": f"Q1 Sales Boost {timestamp}",
        "accountId": account['id'],
        "startDate": "2024-07-01",
        "endDate": "2024-07-31",
        "promotionType": "discount",
        "budget": "10000.00"
    }
    promotion = safe_api_call(f"{BASE_URL}/api/promotions", promotion_data, "Create Promotion")
    if not promotion:
        return False
    
    # Step 4: Create sales data
    sales_data = {
        "promotionId": promotion['id'],
        "accountId": account['id'],
        "productId": product['id'],
        "salesDate": "2024-07-15",
        "unitsLift": 150,
        "dollarLift": "2500.00",
        "baselineSales": "5000.00",
        "incrementalSales": "2500.00",
        "roi": "125.50"
    }
    sales_record = safe_api_call(f"{BASE_URL}/api/sales-data", sales_data, "Create Sales Data")
    
    if sales_record:
        print(f"\n🎉 Complete workflow successful!")
        print(f"   Account ID: {account['id']}")
        print(f"   Product ID: {product['id']}")
        print(f"   Promotion ID: {promotion['id']}")
        print(f"   Sales Record ID: {sales_record['id']}")
        return True
    else:
        return False

def create_sales_data_only(promotion_id, account_id, product_id):
    """Create sales data if you already have valid IDs"""
    sales_data = {
        "promotionId": promotion_id,
        "accountId": account_id,
        "productId": product_id,
        "salesDate": "2024-07-15",
        "unitsLift": 150,
        "dollarLift": "2500.00",
        "baselineSales": "5000.00",
        "incrementalSales": "2500.00",
        "roi": "125.50"
    }
    
    return safe_api_call(f"{BASE_URL}/api/sales-data", sales_data, "Create Sales Data")

# Example usage:
if __name__ == "__main__":
    print("🚀 Testing TPM API Integration from Databricks")
    print("=" * 50)
    
    # Option 1: Create everything from scratch
    success = create_complete_sales_record()
    
    if success:
        print("\n✅ Integration test completed successfully!")
    else:
        print("\n❌ Integration test failed!")
    
    # Option 2: If you have existing IDs, use this:
    # create_sales_data_only(promotion_id=1, account_id=1, product_id=1)