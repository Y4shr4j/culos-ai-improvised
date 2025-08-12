import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

async function testGenerateEndpoint() {
  try {
    console.log('Testing generate endpoint...');
    console.log('Base URL:', BASE_URL);
    
    // First, test the debug endpoint
    console.log('\n1. Testing debug endpoint...');
    const debugResponse = await axios.get(`${BASE_URL}/debug/config`);
    console.log('Debug config:', debugResponse.data);
    
    // Check if we have a valid token (you'll need to get this from your login)
    const token = process.env.TEST_TOKEN;
    if (!token) {
      console.log('\n⚠️ No TEST_TOKEN found. Please set TEST_TOKEN in your .env file after logging in.');
      console.log('You can get a token by logging in through your app and copying it from localStorage.');
      return;
    }
    
    console.log('\n2. Testing generate endpoint with token...');
    const generateResponse = await axios.post(`${BASE_URL}/generate`, {
      prompt: "A beautiful sunset over mountains",
      aspectRatio: "16:9",
      category: "landscape",
      type: "image",
      categorySelections: {}
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Generate response:', generateResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Headers:', error.response?.headers);
  }
}

testGenerateEndpoint();
