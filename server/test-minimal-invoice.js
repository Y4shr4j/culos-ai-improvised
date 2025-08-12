import fetch from 'node-fetch';

const NOWPAY_API_KEY = 'P2JV2BC-RQ4MH0S-G4S2TM1-51KBJC7';
const NOWPAY_API = 'https://api.nowpayments.io/v1';

async function testMinimalInvoice() {
  try {
    console.log('Testing minimal NOWPayments invoice...');
    
    // Try with absolute minimum fields
    const minimalData = {
      price_amount: 5.00,
      price_currency: 'usd',
      order_id: `test_${Date.now()}`,
      order_description: 'Test invoice'
    };

    console.log('Minimal data:', JSON.stringify(minimalData, null, 2));

    const resp = await fetch(`${NOWPAY_API}/invoice`, {
      method: 'POST',
      headers: {
        'x-api-key': NOWPAY_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(minimalData)
    });

    const data = await resp.json();
    console.log('Response status:', resp.status);
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (resp.ok) {
      console.log('✅ Minimal invoice created successfully');
    } else {
      console.log('❌ Minimal invoice failed:', data.message);
    }

  } catch (error) {
    console.error('Error testing minimal invoice:', error);
  }
}

testMinimalInvoice();
