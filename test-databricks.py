import requests

url = "https://bb43520f-8ef1-4b15-a75b-538724300d5c-00-6u6cx2ze6vkw.picard.replit.dev/api/sales-data"
headers = {
    "Content-Type": "application/json",
    "X-API-Key": "tpm_mdesdyap_rjb79frtixe"
}
data = {
    "promotionId": 1,
    "accountId": 1,
    "productId": 1,
    "salesDate": "2024-07-15",
    "unitsLift": 150,
    "dollarLift": "2500.00",
    "baselineSales": "5000.00",
    "incrementalSales": "2500.00",
    "roi": "125.50"
}

print("Testing your exact Databricks code...")
print(f"URL: {url}")
print(f"Headers: {headers}")
print(f"Data: {data}")

response = requests.post(url, headers=headers, json=data)
print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")

if response.status_code != 200:
    print("❌ Request failed!")
else:
    print("✅ Request successful!")