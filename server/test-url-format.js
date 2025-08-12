import fetch from 'node-fetch';

const NOWPAY_API_KEY = 'P2JV2BC-RQ4MH0S-G4S2TM1-51KBJC7';
const NOWPAY_API = 'https://api.nowpayments.io/v1';

async function testUrlFormats() {
  const testCases = [
    {
      name: 'Simple example.com URLs',
      data: {
        price_amount: 5.00,
        price_currency: 'usd',
        order_id: `test_${Date.now()}`,
        order_description: 'Test invoice',
        success_url: 'https://example.com/success?invoice_id={invoice_id}',
        cancel_url: 'https://example.com/cancel',
        partially_paid_url: 'https://example.com/partial',
        is_fixed_rate: true,
        is_fee_paid_by_user: false
      }
    },
    {
      name: 'Without optional URLs',
      data: {
        price_amount: 5.00,
        price_currency: 'usd',
        order_id: `test_${Date.now()}`,
        order_description: 'Test invoice'
      }
    },
    {
      name: 'With different URL format',
      data: {
        price_amount: 5.00,
        price_currency: 'usd',
        order_id: `test_${Date.now()}`,
        order_description: 'Test invoice',
        success_url: 'https://httpbin.org/get?invoice_id={invoice_id}',
        cancel_url: 'https://httpbin.org/get',
        partially_paid_url: 'https://httpbin.org/get',
        is_fixed_rate: true,
        is_fee_paid_by_user: false
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log('Data:', JSON.stringify(testCase.data, null, 2));
    
    try {
      const resp = await fetch(`${NOWPAY_API}/invoice`, {
        method: 'POST',
        headers: {
          'x-api-key': NOWPAY_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testCase.data)
      });

      const data = await resp.json();
      console.log('Response status:', resp.status);
      console.log('Response:', JSON.stringify(data, null, 2));

      if (resp.ok) {
        console.log('✅ SUCCESS!');
        return;
      } else {
        console.log('❌ Failed:', data.message);
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
}

testUrlFormats();
