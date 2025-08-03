import express from 'express';
import passport from 'passport';
import { login, register, socialAuthCallback, getMe, verifyAge } from '../controllers/auth.controller';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

// Helper function to check if a strategy is available
const isStrategyAvailable = (strategyName: string): boolean => {
  return (passport as any)._strategies && (passport as any)._strategies[strategyName];
};

// Local authentication routes
router.post('/login', login);
router.post('/register', register);

// Social authentication routes - only register if strategies are available
if (isStrategyAvailable('google')) {
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'] 
}));

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/login',
    session: false 
  }), 
  socialAuthCallback
);
} else {
  // Fallback route for when Google OAuth is not configured
  router.get('/google', (req, res) => {
    res.status(400).json({ 
      message: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.' 
    });
  });
  
  router.get('/google/callback', (req, res) => {
    res.status(400).json({ 
      message: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.' 
    });
  });
}

if (isStrategyAvailable('facebook')) {
router.get('/facebook', passport.authenticate('facebook', { 
  scope: ['public_profile'] 
}));

router.get('/facebook/callback',
  passport.authenticate('facebook', { 
    failureRedirect: '/login',
    session: false 
  }),
  socialAuthCallback
);
} else {
  // Fallback route for when Facebook OAuth is not configured
  router.get('/facebook', (req, res) => {
    res.status(400).json({ 
      message: 'Facebook OAuth is not configured. Please set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET environment variables.' 
    });
  });
  
  router.get('/facebook/callback', (req, res) => {
    res.status(400).json({ 
      message: 'Facebook OAuth is not configured. Please set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET environment variables.' 
    });
  });
}

// Protected routes
router.get('/me', isAuthenticated, getMe);
router.post('/verify-age/:userId', isAuthenticated, verifyAge);

export default router;
