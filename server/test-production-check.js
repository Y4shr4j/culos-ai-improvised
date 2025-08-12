import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Environment Check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('CLIENT_URL:', process.env.CLIENT_URL);
console.log('BACKEND_URL:', process.env.BACKEND_URL);

// Check if we're in production (not localhost)
const baseUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL;
const backendUrl = process.env.BACKEND_URL;

const isProduction = baseUrl && !baseUrl.includes('localhost') && !baseUrl.includes('127.0.0.1');

console.log('\n📊 Production Detection:');
console.log('Base URL:', baseUrl);
console.log('Backend URL:', backendUrl);
console.log('Is Production:', isProduction);

if (isProduction) {
  console.log('❌ Server thinks it\'s in production!');
  console.log('This is why NOWPayments is rejecting the URLs.');
} else {
  console.log('✅ Server correctly detects local development.');
}
