// Test URL construction for NOWPayments
const baseUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000';
const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

// Remove trailing slashes and ensure proper URL format
const cleanBaseUrl = baseUrl.replace(/\/$/, '');
const cleanBackendUrl = backendUrl.replace(/\/$/, '');

console.log('URL Construction Test:');
console.log('Original baseUrl:', baseUrl);
console.log('Original backendUrl:', backendUrl);
console.log('Clean baseUrl:', cleanBaseUrl);
console.log('Clean backendUrl:', cleanBackendUrl);

const testUrls = {
  success_url: `${cleanBaseUrl}/payment/success?invoice_id={invoice_id}`,
  cancel_url: `${cleanBaseUrl}/payment/cancel`,
  ipn_callback_url: `${cleanBackendUrl}/api/payment/crypto/webhook`,
  partially_paid_url: `${cleanBaseUrl}/payment/partial`
};

console.log('\nGenerated URLs:');
Object.entries(testUrls).forEach(([key, url]) => {
  console.log(`${key}: ${url}`);
});

// Test if URLs are valid
console.log('\nURL Validation:');
Object.entries(testUrls).forEach(([key, url]) => {
  try {
    new URL(url);
    console.log(`✅ ${key}: Valid URL`);
  } catch (error) {
    console.log(`❌ ${key}: Invalid URL - ${error.message}`);
  }
});
