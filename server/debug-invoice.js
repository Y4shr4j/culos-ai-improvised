// Debug script to see what invoice data is being sent
const baseUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL;
const backendUrl = process.env.BACKEND_URL;

console.log('Environment check:');
console.log('baseUrl:', baseUrl);
console.log('backendUrl:', backendUrl);

// Use minimal required fields for NOWPayments
const invoiceData = {
  price_amount: 5.00,
  price_currency: 'usd',
  order_id: `20-tokens_test_${Date.now()}`,
  order_description: `CulosAI 20-tokens - test@example.com`
};

// Check if we're in production (not localhost)
const isProduction = baseUrl && !baseUrl.includes('localhost') && !baseUrl.includes('127.0.0.1');

console.log('\nIs production:', isProduction);

if (isProduction) {
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  invoiceData.success_url = `${cleanBaseUrl}/payment/success?invoice_id={invoice_id}`;
  invoiceData.cancel_url = `${cleanBaseUrl}/payment/cancel`;
  invoiceData.partially_paid_url = `${cleanBaseUrl}/payment/partial`;
  invoiceData.is_fixed_rate = true;
  invoiceData.is_fee_paid_by_user = false;
}

if (backendUrl && !backendUrl.includes('localhost') && !backendUrl.includes('127.0.0.1')) {
  const cleanBackendUrl = backendUrl.replace(/\/$/, '');
  invoiceData.ipn_callback_url = `${cleanBackendUrl}/api/payment/crypto/webhook`;
}

console.log('\nFinal invoice data:');
console.log(JSON.stringify(invoiceData, null, 2));

// Test URL validation
console.log('\nURL validation:');
if (invoiceData.success_url) {
  try {
    new URL(invoiceData.success_url);
    console.log('✅ success_url: Valid');
  } catch (error) {
    console.log('❌ success_url: Invalid -', error.message);
  }
}
