# Debugging 500 Error in AIImageGeneration

## Problem
The `/api/generate` endpoint is returning a 500 Internal Server Error when called from the AIImageGeneration component.

## Root Causes & Solutions

### 1. Environment Variables (Most Likely Cause)

**Check these environment variables in your Railway deployment:**

```bash
# Required for Stability AI
STABILITY_API_KEY=your_stability_api_key_here

# Required for AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-2
AWS_S3_BUCKET=your_s3_bucket_name

# Required for JWT authentication
JWT_SECRET=your_jwt_secret_here

# Required for database
MONGODB_URI=your_mongodb_connection_string
```

**How to check in Railway:**
1. Go to your Railway project dashboard
2. Click on your service
3. Go to "Variables" tab
4. Verify all the above variables are set

### 2. Test the Debug Endpoint

I've added a debug endpoint to help identify the issue. Visit:
```
https://culosai-production.up.railway.app/api/debug/config
```

This will show you which environment variables are missing or incorrectly configured.

### 3. Check Railway Logs

1. Go to your Railway project dashboard
2. Click on your service
3. Go to "Deployments" tab
4. Click on the latest deployment
5. Check the logs for any error messages

Look for:
- Database connection errors
- Missing environment variables
- Stability AI API errors
- S3 upload errors

### 4. Test Locally

Run the test script I created:

```bash
cd server
node test-generate.js
```

First, get a valid token:
1. Log into your app locally
2. Open browser dev tools
3. Go to Application > Local Storage
4. Copy the `token` value
5. Add it to your `.env` file as `TEST_TOKEN=your_token_here`

### 5. Common Issues & Fixes

#### Issue: "Stability API key not configured"
**Solution:** Get a Stability AI API key from https://platform.stability.ai/

#### Issue: "AWS S3 configuration incomplete"
**Solution:** 
1. Create an AWS S3 bucket
2. Create an IAM user with S3 permissions
3. Get the access key and secret key
4. Set the environment variables

#### Issue: "Database connection failed"
**Solution:** Check your MongoDB connection string in Railway variables

#### Issue: "Invalid token"
**Solution:** The user's authentication token might be expired. Try logging out and back in.

### 6. Enhanced Error Handling

I've improved the error handling in both client and server code. The client will now show more specific error messages:

- **"Not enough tokens"** - User needs to purchase more tokens
- **"AI service configuration error"** - Stability AI API key issue
- **"Storage service error"** - AWS S3 configuration issue
- **"Service is busy"** - Rate limiting from Stability AI

### 7. Quick Fixes to Try

1. **Restart Railway deployment** - Sometimes a restart fixes environment variable issues
2. **Check Stability AI credits** - Ensure your API key has sufficient credits
3. **Verify S3 bucket permissions** - Make sure the bucket allows uploads
4. **Test with a simple prompt** - Try generating with just "test" as the prompt

### 8. Monitoring

After fixing, monitor these endpoints:
- `/api/debug/config` - Environment variable status
- Railway logs - Real-time error monitoring
- Browser console - Client-side errors

## Next Steps

1. Check the debug endpoint first
2. Verify all environment variables in Railway
3. Check Railway logs for specific error messages
4. Test locally if possible
5. Restart the Railway deployment

If you're still having issues, share the output from the debug endpoint and any error messages from the Railway logs.
