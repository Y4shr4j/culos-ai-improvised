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
console.log('Checking Google OAuth config:', {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET'
});

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.OAUTH_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",
      scope: ['profile', 'email'],
      passReqToCallback: true
    },
    async (req: Request, accessToken: string, refreshToken: string, profile: GoogleProfile, done: VerifyCallback) => {
      try {
        const user = await findOrCreateUser(profile, 'google');
        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }
  ));
  console.log('✅ Google OAuth strategy configured successfully');
} else {
  console.warn('Google OAuth not configured: Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variables');
}

// Configure Facebook Strategy only if environment variables are set
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  console.log('Facebook OAuth config:', {
    FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID ? 'SET' : 'NOT SET',
    FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET ? 'SET' : 'NOT SET'
  });
  console.log('Facebook App ID:', process.env.FACEBOOK_APP_ID);
  console.log('Facebook App Secret length:', process.env.FACEBOOK_APP_SECRET?.length || 0);
  
  const facebookStrategy = new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "http://localhost:5000/api/auth/facebook/callback",
      profileFields: ['id', 'emails', 'name', 'displayName', 'photos'],
      passReqToCallback: true
    },
    async (req: Request, accessToken: string, refreshToken: string, profile: FacebookProfile, done: VerifyCallback) => {
      try {
        const user = await findOrCreateUser(profile, 'facebook');
        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }
  );
  
  passport.use(facebookStrategy);
  console.log('✅ Facebook OAuth strategy configured successfully');
} else {
  console.warn('Facebook OAuth not configured: Missing FACEBOOK_APP_ID or FACEBOOK_APP_SECRET environment variables');
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
