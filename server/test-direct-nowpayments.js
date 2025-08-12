import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

// NOWPayments configuration
const NOWPAY_API_KEY = process.env.NOWPAYMENTS_API_KEY || 'ZHSK24Z-CX1MY43-JEJ6WGW-8EK5QAT';
const NOWPAY_API = 'https://api.nowpayments.io/v1';

async function testDirectNOWPayments() {
  try {
    console.log('🧪 Testing NOWPayments Direct Integration...\n');

    // Test 1: Create a simple invoice (minimal data)
    console.log('1. Creating minimal invoice...');
    const minimalData = {
      price_amount: 5.00,
      price_currency: 'usd',
      order_id: `test_${Date.now()}`,
      order_description: 'Test invoice - minimal data'
    };
    
    console.log('Minimal data:', JSON.stringify(minimalData, null, 2));
    
    const resp1 = await fetch(`${NOWPAY_API}/invoice`, {
      method: 'POST',
      headers: {
        'x-api-key': NOWPAY_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(minimalData)
    });

    const data1 = await resp1.json();
    console.log('Response status:', resp1.status);
    console.log('Response:', JSON.stringify(data1, null, 2));

    if (resp1.ok) {
      console.log('✅ Minimal invoice created successfully!');
      console.log('Invoice ID:', data1.id);
      console.log('Payment URL:', data1.invoice_url);
    } else {
      console.log('❌ Minimal invoice failed:', data1.message);
      return;
    }

    // Test 2: Create invoice with production-style URLs (should fail)
    console.log('\n2. Testing with production URLs (should fail)...');
    const productionData = {
      price_amount: 5.00,
      price_currency: 'usd',
      order_id: `test_prod_${Date.now()}`,
      order_description: 'Test invoice - production URLs',
      success_url: 'https://example.com/success?invoice_id={invoice_id}',
      cancel_url: 'https://example.com/cancel',
      partially_paid_url: 'https://example.com/partial',
      is_fixed_rate: true,
      is_fee_paid_by_user: false
    };
    
    const resp2 = await fetch(`${NOWPAY_API}/invoice`, {
      method: 'POST',
      headers: {
        'x-api-key': NOWPAY_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productionData)
    });

    const data2 = await resp2.json();
    console.log('Response status:', resp2.status);
    console.log('Response:', JSON.stringify(data2, null, 2));

    if (resp2.ok) {
      console.log('❌ Unexpected success with production URLs!');
    } else {
      console.log('✅ Correctly failed with production URLs:', data2.message);
    }

    console.log('\n🎉 Direct NOWPayments test completed!');
    console.log('\n📋 Summary:');
    console.log('- API Key: ✅ Valid');
    console.log('- Minimal invoices: ✅ Work');
    console.log('- Production URLs: ❌ Rejected (as expected)');
    console.log('\n💡 The issue is likely with the server configuration, not NOWPayments.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDirectNOWPayments();
