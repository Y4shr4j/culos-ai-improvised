import fetch from 'node-fetch';

const NOWPAY_API_KEY = 'P2JV2BC-RQ4MH0S-G4S2TM1-51KBJC7';
const NOWPAY_API = 'https://api.nowpayments.io/v1';

async function checkInvoiceStatus() {
  try {
    console.log('Checking invoice status...');
    
    // Check the invoice that was created
    const invoiceId = '5296048484';
    
    const resp = await fetch(`${NOWPAY_API}/invoice/${invoiceId}`, {
      headers: {
        'x-api-key': NOWPAY_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const data = await resp.json();
    console.log('Invoice status response:', JSON.stringify(data, null, 2));

    if (resp.ok) {
      console.log('✅ Invoice status retrieved successfully');
      console.log('Status:', data.status);
      console.log('Payment URL:', data.invoice_url || data.pay_url);
    } else {
      console.log('❌ Failed to get invoice status:', data.message);
    }

  } catch (error) {
    console.error('Error checking invoice status:', error);
  }
}

checkInvoiceStatus();
