# OAuth Setup Guide

## The Problem
You're getting a "Bad Request" error from Google OAuth because the environment variables are not set.

## How to Fix

### 1. Create a .env file in the server directory

Create a file called `.env` in the `server/` directory with the following content:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/culosai

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Session Configuration
SESSION_SECRET=your-session-secret-here

# OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
FACEBOOK_APP_ID=your-facebook-app-id-here
FACEBOOK_APP_SECRET=your-facebook-app-secret-here

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:8080
CLIENT_URL=http://localhost:8080

# Environment
NODE_ENV=development
```

### 2. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set up the OAuth consent screen
6. Create a web application client
7. Add these authorized redirect URIs:
   - `http://localhost:5000/auth/google/callback` (for development)
   - `https://culosai-production.up.railway.app/auth/google/callback` (for production)
8. Copy the Client ID and Client Secret to your .env file

### 3. Get Facebook OAuth Credentials (Optional)

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Set up the OAuth redirect URIs:
   - `http://localhost:5000/auth/facebook/callback` (for development)
   - `https://culosai-production.up.railway.app/auth/facebook/callback` (for production)
5. Copy the App ID and App Secret to your .env file

### 4. Restart the Server

After setting up the .env file, restart your server:

```bash
cd server
npm run dev
```

### 5. Test the OAuth

The server will now show clear messages about OAuth configuration status. You should see:
- ✅ Google OAuth strategy configured successfully (if credentials are set)
- ❌ Google OAuth not configured (if credentials are missing)

## Troubleshooting

### If you still get "Bad Request" errors:

1. **Check the callback URL**: Make sure the callback URL in your Google OAuth app matches exactly what's configured in the server
2. **Verify environment variables**: The server will log whether the variables are set or not
3. **Check the OAuth consent screen**: Make sure your app is properly configured in Google Cloud Console
4. **Test with a simple route**: Try accessing `/auth/test` to see if the routes are working

### Common Issues:

1. **Callback URL mismatch**: The callback URL in Google Cloud Console must match exactly
2. **Missing environment variables**: The server needs GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
3. **OAuth consent screen not configured**: You need to set up the consent screen in Google Cloud Console
4. **App not published**: For production, you may need to publish your app or add test users

## Development vs Production

- **Development**: Uses `http://localhost:5000/auth/google/callback`
- **Production**: Uses `https://culosai-production.up.railway.app/auth/google/callback`

Make sure to add both URLs to your Google OAuth app's authorized redirect URIs. 