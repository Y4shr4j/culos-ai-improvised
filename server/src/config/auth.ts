import passport from 'passport';
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy, Profile as FacebookProfile } from 'passport-facebook';
import { UserModel, IUser, ISocialAccount } from '../models/user';
import { generateToken } from '../utils/jwt';
import { Request } from 'express';
import dotenv from 'dotenv';
import { VerifyCallback } from 'passport-oauth2';

// Load environment variables
dotenv.config();

// Extend Express User type to include our custom properties
declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

// Helper function to find or create user from social profile
const findOrCreateUser = async (profile: GoogleProfile | FacebookProfile, provider: 'google' | 'facebook'): Promise<IUser> => {
  const { id, displayName, emails, photos } = profile;
  const email = emails?.[0]?.value || `${id}@${provider}.com`;
  const name = displayName || `${provider} User`;
  const username = `${provider}_${id}`.toLowerCase();
  
  // Check if user already exists with this social account
  const existingUser = await UserModel.findOne({
    'socialAccounts.provider': provider,
    'socialAccounts.providerId': id
  });

  if (existingUser) {
    return existingUser;
  }

  // Check if user exists with the same email but different provider
  const existingEmailUser = await UserModel.findOne({ email });
  if (existingEmailUser) {
    // Add social account to existing user
    existingEmailUser.socialAccounts.push({
      provider,
      providerId: id,
      email,
      name: displayName
    });
    await existingEmailUser.save();
    return existingEmailUser;
  }

  // Create new user with social account
  const newUser = new UserModel({
    name,
    username,
    email,
    socialAccounts: [{
      provider,
      providerId: id,
      email,
      name: displayName
    }],
    tokens: 0, // Start with 0 tokens
    isAdmin: false,
    ageVerified: false
  });

  await newUser.save();
  return newUser;
};

// Configure Google OAuth2.0 only if environment variables are set
console.log('🔧 Checking Google OAuth configuration...');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ SET' : '❌ NOT SET');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ SET' : '❌ NOT SET');

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  // Determine the correct callback URL based on environment
  const getCallbackURL = () => {
    // Debug logging
    console.log('🔍 Environment Debug Info:');
    console.log('  NODE_ENV:', process.env.NODE_ENV);
    console.log('  RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT);
    console.log('  RAILWAY_STATIC_URL:', process.env.RAILWAY_STATIC_URL);
    console.log('  RAILWAY_PUBLIC_DOMAIN:', process.env.RAILWAY_PUBLIC_DOMAIN);
    console.log('  HOSTNAME:', process.env.HOSTNAME);
    console.log('  OAUTH_CALLBACK_URL:', process.env.OAUTH_CALLBACK_URL);
    
    // If OAUTH_CALLBACK_URL is explicitly set, use it
    if (process.env.OAUTH_CALLBACK_URL) {
      console.log('Using explicit OAUTH_CALLBACK_URL:', process.env.OAUTH_CALLBACK_URL);
      return process.env.OAUTH_CALLBACK_URL;
    }
    
    // If SERVER_URL is set, use it as base
    if (process.env.SERVER_URL) {
      const serverUrl = `${process.env.SERVER_URL}/auth/google/callback`;
      console.log('Using SERVER_URL for callback:', serverUrl);
      return serverUrl;
    }
    
    // Check if we're in production environment (Railway sets RAILWAY_ENVIRONMENT)
    const isProduction = process.env.NODE_ENV === 'production' || 
                        process.env.RAILWAY_ENVIRONMENT === 'production' ||
                        process.env.RAILWAY_ENVIRONMENT === 'main' ||
                        process.env.RAILWAY_STATIC_URL ||
                        process.env.RAILWAY_PUBLIC_DOMAIN ||
                        process.env.RAILWAY_PROJECT_ID ||
                        process.env.RAILWAY_SERVICE_ID ||
                        process.env.RAILWAY_DEPLOYMENT_ID ||
                        process.env.HOSTNAME?.includes('railway') ||
                        process.env.HOSTNAME?.includes('up.railway.app');
    
    // For production, prefer SERVER_URL or VITE_API_BASE_URL; fallback to Railway URL
    if (isProduction) {
      const base = (process.env.SERVER_URL || process.env.VITE_API_BASE_URL || 'https://culosai-production.up.railway.app').replace(/\/$/, '');
      const productionUrl = `${base}/auth/google/callback`;
      console.log('Using production callback URL:', productionUrl);
      return productionUrl;
    }
    
    // For development, use dynamic port detection
    const serverPort = process.env.PORT || 5000;
    const devUrl = `http://localhost:${serverPort}/auth/google/callback`;
    console.log('Using development callback URL:', devUrl);
    return devUrl;
  };

  const callbackURL = getCallbackURL();
  console.log('Final Google callback URL:', callbackURL);

  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: callbackURL,
      scope: ['profile', 'email'],
      passReqToCallback: true
    },
    async (req: Request, accessToken: string, refreshToken: string, profile: GoogleProfile, done: VerifyCallback) => {
      try {
        console.log('🔍 Google OAuth callback received for user:', profile.displayName);
        const user = await findOrCreateUser(profile, 'google');
        console.log('✅ User processed successfully:', user.email);
        return done(null, user);
      } catch (error) {
        console.error('❌ Error in Google OAuth callback:', error);
        return done(error as Error);
      }
    }
  ));
  console.log('✅ Google OAuth strategy configured successfully');
} else {
  console.warn('⚠️ Google OAuth not configured: Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variables');
  console.warn('To enable Google OAuth, please set these environment variables:');
  console.warn('GOOGLE_CLIENT_ID=your-google-client-id');
  console.warn('GOOGLE_CLIENT_SECRET=your-google-client-secret');
}

// Configure Facebook Strategy only if environment variables are set
console.log('🔧 Checking Facebook OAuth configuration...');
console.log('FACEBOOK_APP_ID:', process.env.FACEBOOK_APP_ID ? '✅ SET' : '❌ NOT SET');
console.log('FACEBOOK_APP_SECRET:', process.env.FACEBOOK_APP_SECRET ? '✅ SET' : '❌ NOT SET');

if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  // Determine the correct callback URL for Facebook
  const getFacebookCallbackURL = () => {
    // If OAUTH_CALLBACK_URL is explicitly set, use it
    if (process.env.OAUTH_CALLBACK_URL) {
      const facebookUrl = process.env.OAUTH_CALLBACK_URL.replace('/google/callback', '/facebook/callback');
      console.log('Using explicit Facebook callback URL:', facebookUrl);
      return facebookUrl;
    }
    
    // If SERVER_URL is set, use it as base
    if (process.env.SERVER_URL) {
      const serverUrl = `${process.env.SERVER_URL}/auth/facebook/callback`;
      console.log('Using SERVER_URL for Facebook callback:', serverUrl);
      return serverUrl;
    }
    
    // Check if we're in production environment (Railway sets RAILWAY_ENVIRONMENT)
    const isProduction = process.env.NODE_ENV === 'production' || 
                        process.env.RAILWAY_ENVIRONMENT === 'production' ||
                        process.env.RAILWAY_ENVIRONMENT === 'main' ||
                        process.env.RAILWAY_STATIC_URL ||
                        process.env.RAILWAY_PUBLIC_DOMAIN ||
                        process.env.RAILWAY_PROJECT_ID ||
                        process.env.RAILWAY_SERVICE_ID ||
                        process.env.RAILWAY_DEPLOYMENT_ID ||
                        process.env.HOSTNAME?.includes('railway') ||
                        process.env.HOSTNAME?.includes('up.railway.app');
    
    // For production, prefer SERVER_URL or VITE_API_BASE_URL; fallback to Railway URL
    if (isProduction) {
      const base = (process.env.SERVER_URL || process.env.VITE_API_BASE_URL || 'https://culosai-production.up.railway.app').replace(/\/$/, '');
      const productionUrl = `${base}/auth/facebook/callback`;
      console.log('Using production Facebook callback URL:', productionUrl);
      return productionUrl;
    }
    
    // For development, use dynamic port detection
    const serverPort = process.env.PORT || 5000;
    const devUrl = `http://localhost:${serverPort}/auth/facebook/callback`;
    console.log('Using development Facebook callback URL:', devUrl);
    return devUrl;
  };

  const facebookCallbackURL = getFacebookCallbackURL();
  console.log('Final Facebook callback URL:', facebookCallbackURL);

  const facebookStrategy = new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: facebookCallbackURL,
      profileFields: ['id', 'emails', 'name', 'displayName', 'photos'],
      passReqToCallback: true
    },
    async (req: Request, accessToken: string, refreshToken: string, profile: FacebookProfile, done: VerifyCallback) => {
      try {
        console.log('🔍 Facebook OAuth callback received for user:', profile.displayName);
        const user = await findOrCreateUser(profile, 'facebook');
        console.log('✅ User processed successfully:', user.email);
        return done(null, user);
      } catch (error) {
        console.error('❌ Error in Facebook OAuth callback:', error);
        return done(error as Error);
      }
    }
  );
  
  passport.use(facebookStrategy);
  console.log('✅ Facebook OAuth strategy configured successfully');
} else {
  console.warn('⚠️ Facebook OAuth not configured: Missing FACEBOOK_APP_ID or FACEBOOK_APP_SECRET environment variables');
  console.warn('To enable Facebook OAuth, please set these environment variables:');
  console.warn('FACEBOOK_APP_ID=your-facebook-app-id');
  console.warn('FACEBOOK_APP_SECRET=your-facebook-app-secret');
}

// Serialize user into the sessions
passport.serializeUser((user: Express.User, done: (err: any, id?: unknown) => void) => {
  done(null, user.id);
});

// Deserialize user from the sessions
passport.deserializeUser(async (id: string, done: (err: any, user?: Express.User | false | null) => void) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error as Error, undefined);
  }
});

export default passport;
