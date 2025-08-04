# 🚀 CulosAI Deployment Guide

## **Quick Start - Railway (Recommended)**

### **1. Backend Deployment (Railway)**

1. **Sign up for Railway**: https://railway.app
2. **Connect your GitHub repository**
3. **Create a new project** and select your repository
4. **Set environment variables**:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   VENICE_API_KEY=your_venice_api_key
   STABILITY_API_KEY=your_stability_api_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   FACEBOOK_APP_ID=your_facebook_app_id
   FACEBOOK_APP_SECRET=your_facebook_app_secret
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   NODE_ENV=production
   PORT=5000
   ```
5. **Deploy**: Railway will automatically deploy your backend
6. **Get your backend URL**: Copy the generated URL (e.g., `https://culosai-backend.railway.app`)

### **2. Frontend Deployment (Vercel)**

1. **Sign up for Vercel**: https://vercel.com
2. **Connect your GitHub repository**
3. **Import your project** and select the `client` folder
4. **Set environment variables**:
   ```
   VITE_API_BASE_URL=https://your-backend-url.railway.app
   VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
   ```
5. **Update vercel.json**: Replace `your-backend-url.com` with your actual Railway backend URL
6. **Deploy**: Vercel will automatically deploy your frontend

## **Alternative Deployment Options**

### **Option 1: Render**

#### **Backend on Render**
1. Sign up at https://render.com
2. Create a new Web Service
3. Connect your GitHub repository
4. Set build command: `npm install && npm run build`
5. Set start command: `npm start`
6. Add environment variables
7. Deploy

#### **Frontend on Render**
1. Create a new Static Site
2. Connect your GitHub repository
3. Set build command: `npm install && npm run build`
4. Set publish directory: `dist`
5. Add environment variables
6. Deploy

### **Option 2: DigitalOcean App Platform**

1. Sign up at https://digitalocean.com
2. Create a new App
3. Connect your GitHub repository
4. Configure build settings
5. Set environment variables
6. Deploy

### **Option 3: Heroku**

#### **Backend on Heroku**
1. Install Heroku CLI
2. Create a new Heroku app
3. Set buildpacks
4. Configure environment variables
5. Deploy

## **Environment Variables Setup**

### **Required Environment Variables**

#### **Backend (.env)**
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/culosai

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# AI APIs
GEMINI_API_KEY=your_gemini_api_key
VENICE_API_KEY=your_venice_api_key
STABILITY_API_KEY=your_stability_api_key

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Payments
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Server
PORT=5000
NODE_ENV=production
CLIENT_URL=https://your-frontend-url.com
CORS_ORIGIN=https://your-frontend-url.com
```

#### **Frontend (.env)**
```env
VITE_API_BASE_URL=https://your-backend-url.com
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
```

## **Database Setup**

### **MongoDB Atlas (Recommended)**
1. Sign up at https://mongodb.com/atlas
2. Create a new cluster
3. Set up database access (username/password)
4. Set up network access (IP whitelist)
5. Get your connection string
6. Add to environment variables

### **Local MongoDB**
- Install MongoDB locally
- Use connection string: `mongodb://localhost:27017/culosai`

## **Domain Setup**

### **Custom Domain (Optional)**
1. Purchase a domain (e.g., from Namecheap, GoDaddy)
2. Configure DNS settings
3. Add domain to your deployment platform
4. Set up SSL certificates

## **Post-Deployment Checklist**

- [ ] Test all API endpoints
- [ ] Verify authentication works
- [ ] Test AI chat functionality
- [ ] Test image/video generation
- [ ] Verify payment integration
- [ ] Check admin panel access
- [ ] Test file uploads
- [ ] Verify email functionality
- [ ] Check mobile responsiveness
- [ ] Monitor error logs

## **Monitoring & Maintenance**

### **Logs**
- Monitor application logs regularly
- Set up error tracking (Sentry)
- Monitor API response times

### **Backups**
- Set up database backups
- Backup environment variables
- Document deployment procedures

### **Updates**
- Keep dependencies updated
- Monitor security vulnerabilities
- Plan regular maintenance windows

## **Troubleshooting**

### **Common Issues**

1. **CORS Errors**
   - Check CORS_ORIGIN environment variable
   - Verify frontend URL is correct

2. **Database Connection Issues**
   - Check MONGODB_URI format
   - Verify network access settings

3. **API Key Issues**
   - Verify all API keys are valid
   - Check environment variable names

4. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed

### **Support**
- Check platform-specific documentation
- Monitor application logs
- Test locally before deploying

## **Cost Estimation**

### **Free Tier Options**
- **Railway**: $5/month after free tier
- **Vercel**: Free for personal projects
- **Render**: Free tier available
- **MongoDB Atlas**: Free tier available

### **Production Costs**
- **Railway**: $5-20/month
- **Vercel**: $20/month (Pro)
- **MongoDB Atlas**: $9/month
- **Domain**: $10-15/year

**Total Estimated Cost**: $15-50/month for production deployment 