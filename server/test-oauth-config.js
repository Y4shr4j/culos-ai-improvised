#!/usr/bin/env node

// Test script to verify OAuth configuration
import dotenv from 'dotenv';
dotenv.config();

console.log('🔧 Testing OAuth Configuration...\n');

// Check environment variables
console.log('Environment Variables:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ SET' : '❌ NOT SET');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ SET' : '❌ NOT SET');
console.log('PORT:', process.env.PORT || '5000 (default)');
console.log('SERVER_URL:', process.env.SERVER_URL || 'NOT SET');
console.log('OAUTH_CALLBACK_URL:', process.env.OAUTH_CALLBACK_URL || 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT || 'NOT SET');

// Determine callback URL logic
console.log('\n🔍 Callback URL Logic:');

if (process.env.OAUTH_CALLBACK_URL) {
  console.log('1. Using explicit OAUTH_CALLBACK_URL:', process.env.OAUTH_CALLBACK_URL);
} else if (process.env.SERVER_URL) {
  const serverUrl = `${process.env.SERVER_URL}/auth/google/callback`;
  console.log('2. Using SERVER_URL for callback:', serverUrl);
} else {
  const isProduction = process.env.NODE_ENV === 'production' || 
                      process.env.RAILWAY_ENVIRONMENT === 'production' ||
                      process.env.RAILWAY_ENVIRONMENT === 'main' ||
                      process.env.RAILWAY_STATIC_URL ||
                      process.env.RAILWAY_PUBLIC_DOMAIN;
  
  if (isProduction) {
    const productionUrl = `https://culosai-production.up.railway.app/auth/google/callback`;
    console.log('3. Using production callback URL:', productionUrl);
  } else {
    const serverPort = process.env.PORT || 5000;
    const devUrl = `http://localhost:${serverPort}/auth/google/callback`;
    console.log('4. Using development callback URL:', devUrl);
  }
}

console.log('\n📋 Next Steps:');
console.log('1. Make sure the callback URL above is added to your Google OAuth app');
console.log('2. Restart your server after making any changes');
console.log('3. Check server logs for "Final Google callback URL" message');
console.log('4. Test OAuth login to verify it works');

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.log('\n❌ ERROR: Missing Google OAuth credentials!');
  console.log('Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file');
} else {
  console.log('\n✅ Google OAuth credentials are set!');
}
