import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const NOWPAY_API_KEY = process.env.NOWPAYMENTS_API_KEY || 'ZHSK24Z-CX1MY43-JEJ6WGW-8EK5QAT';
const NOWPAY_API = 'https://api.nowpayments.io/v1';

async function testApiKey() {
  try {
    console.log('🔑 Testing NOWPayments API key...');
    console.log('API Key:', NOWPAY_API_KEY);
    
    // Test the API key by creating a simple invoice
    const testData = {
      price_amount: 1.00,
      price_currency: 'usd',
      order_id: `test_${Date.now()}`,
      order_description: 'API Key Test'
    };
    
    console.log('Test data:', JSON.stringify(testData, null, 2));
    
    const resp = await fetch(`${NOWPAY_API}/invoice`, {
      method: 'POST',
      headers: {
        'x-api-key': NOWPAY_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    const data = await resp.json();
    console.log('Response status:', resp.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (resp.ok) {
      console.log('✅ API key is valid! Invoice created successfully.');
    } else {
      console.log('❌ API key test failed:', data.message);
    }

  } catch (error) {
    console.error('Error testing API key:', error.message);
  }
}

testApiKey();
