import { Request, Response } from 'express';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/user';
import { generateToken } from '../utils/jwt';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await UserModel.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password is correct
    if (!user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken((user._id as any).toString());
    
    // Remove password from response
    const userObj = user.toObject();
    delete userObj.password;
    
    res.json({ token, user: userObj });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const user = new UserModel({
      name,
      email,
      password: hashedPassword,
      username: email.split('@')[0], // Simple username from email
    });
    
    await user.save();
    
    // Generate JWT token
    const token = generateToken((user._id as any).toString());
    
    // Remove password from response
    const userObj = user.toObject();
    delete userObj.password;
    
    res.status(201).json({ token, user: userObj });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const socialAuthCallback = (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }
    
    // Generate JWT token
    const token = generateToken((req.user._id as any).toString());
    
    // Redirect to frontend with token and user info
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    const userStr = encodeURIComponent(JSON.stringify(req.user));
    const redirectUrl = `${frontendUrl}/auth/callback?token=${token}&user=${userStr}`;
    console.log('Redirecting to:', redirectUrl);
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Social auth callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    res.redirect(`${frontendUrl}/auth/error`);
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findById(req.user?._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyAge = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { isOver18 } = req.body;
    
    if (!isOver18) {
      return res.status(400).json({ message: 'Age verification failed' });
    }
    
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { ageVerified: true },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'Age verified successfully', user });
  } catch (error) {
    console.error('Age verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
