# 🔧 Environment Variables Setup

## **Project Structure**
```
culosai-main/
├── / (Frontend - React/Vite)
├── /server (Backend - Node.js/Express)
└── /shared (Shared types)
```

## **Quick Setup Guide**

### **1. Backend Environment Variables**

Create a `.env` file in the `server` folder with these variables:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/culosai

# JWT Secret (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# AI API Keys
GEMINI_API_KEY=your_gemini_api_key_from_google_ai_studio
VENICE_API_KEY=your_venice_api_key_from_venice_ai
STABILITY_API_KEY=your_stability_api_key_from_stability_ai

# OAuth (Optional - for social login)
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Payments (Optional - for token purchases)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Server Configuration
PORT=5000
NODE_ENV=production
CLIENT_URL=https://your-frontend-url.com
CORS_ORIGIN=https://your-frontend-url.com
```

### **2. Frontend Environment Variables**

Create a `.env` file in the **root directory** (main folder) with these variables:

```env
VITE_API_BASE_URL=https://your-backend-url.com
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
```

## **How to Get API Keys**

### **1. MongoDB Atlas (Database)**
1. Go to https://mongodb.com/atlas
2. Sign up and create a free cluster
3. Create a database user
4. Get your connection string
5. Replace `username`, `password`, and `cluster` in the connection string

### **2. Google Gemini API**
1. Go to https://aistudio.google.com/
2. Create a new API key
3. Copy the API key

### **3. Venice AI API**
1. Go to https://venice.ai
2. Sign up and get your API key
3. Copy the API key

### **4. Stability AI API**
1. Go to https://platform.stability.ai
2. Sign up and get your API key
3. Copy the API key

### **5. JWT Secret**
Generate a random string (at least 32 characters):
```bash
# On Windows PowerShell:
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})

# Or use an online generator
```

## **Deployment Platforms**

### **Railway (Backend)**
1. Go to https://railway.app
2. Create a new project
3. Set **Source Directory** to `server`
4. Add all environment variables from the backend section above

### **Vercel (Frontend)**
1. Go to https://vercel.com
2. Import your project (select root directory)
3. Add environment variables from the frontend section above

## **Security Notes**

- ✅ Never commit `.env` files to git
- ✅ Use strong, unique JWT secrets
- ✅ Keep API keys secure
- ✅ Use HTTPS in production
- ✅ Regularly rotate API keys

## **Testing Locally**

1. Create `.env` files in both root and `server` folders
2. Run `npm install` in both root and `server` folders
3. Start backend: `cd server && npm run dev`
4. Start frontend: `npm run dev` (from root directory)
5. Test all functionality before deploying 