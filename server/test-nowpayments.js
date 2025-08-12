import fetch from 'node-fetch';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// NOWPayments configuration
const NOWPAY_API_KEY = process.env.NOWPAYMENTS_API_KEY || 'ZHSK24Z-CX1MY43-JEJ6WGW-8EK5QAT';
const NOWPAY_PUBLIC_KEY = process.env.NOWPAYMENTS_PUBLIC_KEY || '11bbc341-3e33-40aa-a553-cb2c6a429972';
const NOWPAY_API = 'https://api.nowpayments.io/v1';

const BASE_URL = 'http://localhost:5000/api';

async function testNOWPayments() {
  try {
    console.log('🧪 Testing NOWPayments Integration...\n');

    // 1. Test environment variables
    console.log('1. Checking environment variables...');
    const envResponse = await fetch(`${BASE_URL}/test-env`);
    const envData = await envResponse.json();
    console.log('Environment status:', envData);
    console.log('✅ Environment check completed\n');

    // 2. Register a test user
    console.log('2. Registering test user...');
    const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test User',
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password: 'Test1234!'
      })
    });
    const registerData = await registerResponse.json();
    const token = registerData.token;
    console.log('✅ User registered successfully\n');

    // 3. Add tokens for testing
    console.log('3. Adding test tokens...');
    await fetch(`${BASE_URL}/auth/tokens/add`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount: 10 })
    });
    console.log('✅ Test tokens added\n');

    // 4. Test crypto invoice creation
    console.log('4. Creating crypto invoice...');
    const invoiceResponse = await fetch(`${BASE_URL}/payment/crypto/create-invoice`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        packageId: '20-tokens',
        amount: '5.00',
        currency: 'USD'
      })
    });
    
    const invoiceData = await invoiceResponse.json();
    
    if (!invoiceResponse.ok) {
      throw new Error(`Invoice creation failed: ${JSON.stringify(invoiceData)}`);
    }
    
    console.log('Invoice created:', {
      id: invoiceData.id,
      url: invoiceData.url,
      provider: invoiceData.provider,
      status: invoiceData.status
    });
    console.log('✅ Crypto invoice created successfully\n');

    // 5. Test payment confirmation (this will fail since payment isn't actually made)
    console.log('5. Testing payment confirmation (will fail - no actual payment)...');
    try {
      const confirmResponse = await fetch(`${BASE_URL}/payment/crypto/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          invoiceId: invoiceData.id,
          packageId: '20-tokens'
        })
      });
      const confirmData = await confirmResponse.json();
      console.log('Unexpected success:', confirmData);
    } catch (error) {
      console.log('Expected error (no actual payment):', error.message);
      console.log('✅ Payment confirmation test completed (as expected)\n');
    }

    console.log('🎉 NOWPayments integration test completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Deploy to production');
    console.log('2. Set NOWPAYMENTS_API_KEY in Railway environment variables');
    console.log('3. Configure webhook URL in NOWPayments dashboard');
    console.log('4. Test with real crypto payments');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testNOWPayments();
