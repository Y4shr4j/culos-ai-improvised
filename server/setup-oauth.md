# OAuth Setup Guide

## The Problem
You're getting a "Bad Request" error from Google OAuth because the environment variables are not set or the callback URL is incorrect.

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

# Server Configuration (IMPORTANT for OAuth callbacks)
PORT=5000
SERVER_URL=http://localhost:5000
# OR for production:
# SERVER_URL=https://your-production-domain.com

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
   - **If your server runs on a different port, add that URL too**
8. Copy the Client ID and Client Secret to your .env file

### 3. Get Facebook OAuth Credentials (Optional)

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Set up the OAuth redirect URIs:
   - `http://localhost:5000/auth/facebook/callback` (for development)
   - `https://culosai-production.up.railway.app/auth/facebook/callback` (for production)
   - **If your server runs on a different port, add that URL too**
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
- The exact callback URL being used

## Troubleshooting

### If you still get "Bad Request" errors:

1. **Check the callback URL**: Make sure the callback URL in your Google OAuth app matches exactly what's configured in the server
2. **Verify environment variables**: The server will log whether the variables are set or not
3. **Check the OAuth consent screen**: Make sure your app is properly configured in Google Cloud Console
4. **Test with a simple route**: Try accessing `/auth/test` to see if the routes are working
5. **Check server logs**: Look for the "Final Google callback URL" log message to see what URL is being used

### Common Issues:

1. **Callback URL mismatch**: The callback URL in Google Cloud Console must match exactly
2. **Missing environment variables**: The server needs GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
3. **OAuth consent screen not configured**: You need to set up the consent screen in Google Cloud Console
4. **App not published**: For production, you may need to publish your app or add test users
5. **Wrong port**: If your server runs on a different port, make sure to add that URL to Google OAuth

## Development vs Production

### Development Setup:
- **Server URL**: `http://localhost:5000` (or whatever port your server runs on)
- **Callback URL**: `http://localhost:5000/auth/google/callback`
- **Frontend URL**: `http://localhost:8080`

### Production Setup:
- **Server URL**: `https://your-production-domain.com`
- **Callback URL**: `https://your-production-domain.com/auth/google/callback`
- **Frontend URL**: `https://your-frontend-domain.com`

## Environment Variables Priority

The callback URL is determined in this order:
1. `OAUTH_CALLBACK_URL` (if explicitly set)
2. `SERVER_URL` + `/auth/google/callback` (if SERVER_URL is set)
3. Production URL (if in production environment)
4. Development URL with dynamic port detection

Make sure to add all relevant URLs to your Google OAuth app's authorized redirect URIs. 