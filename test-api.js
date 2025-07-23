import fetch from 'node-fetch';

async function testApi() {
  try {
    const response = await fetch('http://localhost:5000/api/sales-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'tpm_mdesdyap_rjb79frtixe'
      },
      body: JSON.stringify({
        "promotionId": 1,
        "accountId": 1,
        "productId": 1,
        "salesDate": "2024-07-15",
        "unitsLift": 150,
        "dollarLift": "2500.00",
        "baselineSales": "5000.00",
        "incrementalSales": "2500.00",
        "roi": "125.50"
      })
    });

    console.log('Status:', response.status);
    const result = await response.text();
    console.log('Response:', result);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testApi();