import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/db";
import { UserModel, IUser } from "./models/user";
import cookieParser from "cookie-parser";
import axios from "axios";
import FormData from "form-data";
import multer from "multer";
import session from "cookie-session";
import passport from "./config/auth";
import authRoutes from "./routes/auth.routes";
import imageRoutes from './routes/image.routes';
import paymentRoutes from './routes/payment.routes';
import adminRoutes from './routes/admin.routes';

import postRoutes from './routes/post.routes';
import characterRoutes from './routes/character.routes';
import chatRoutes from './routes/chat.routes';

// Add MulterRequest interface for type safety
interface MulterRequest extends Request {
  file: Express.Multer.File;
}

// Load env
dotenv.config();

// Init app
const app = express();

const whitelist = [
  "http://localhost:8080", 
  "http://localhost:8081",
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow all origins for now - you can restrict this later
    callback(null, true)
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Session configuration for OAuth
app.use(
  session({
    name: "session",
    keys: [process.env.SESSION_SECRET || 'fallback-session-secret'],
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Connect DB
connectDB();

// Initialize token config if it doesn't exist
const initializeTokenConfig = async () => {
  try {
    const TokenConfig = (await import('./models/tokenConfig')).TokenConfig;
    const existingConfig = await TokenConfig.findOne();
    
    if (!existingConfig) {
      const defaultConfig = new TokenConfig({ tokenPrice: 0.05 });
      await defaultConfig.save();
      console.log('✅ Token config initialized with default price: $0.05');
    }
  } catch (error) {
    console.error('Error initializing token config:', error);
  }
};

// Initialize AI config if it doesn't exist
const initializeAIConfig = async () => {
  try {
    const AIConfig = (await import('./models/aiConfig')).AIConfig;
    const existingConfig = await AIConfig.findOne();
    
    if (!existingConfig) {
      const defaultConfig = new AIConfig({
        provider: 'gemini',
        geminiApiKey: process.env.GEMINI_API_KEY || "",
        veniceApiKey: process.env.VENICE_API_KEY || ""
      });
      await defaultConfig.save();
      console.log('✅ AI config initialized with default provider: Gemini');
    }
  } catch (error) {
    console.error('Error initializing AI config:', error);
  }
};

// Initialize configs after DB connection
setTimeout(() => {
  initializeTokenConfig();
  initializeAIConfig();
}, 1000);

// OAuth routes MUST be defined BEFORE API routes to avoid conflicts
console.log('🔧 Registering OAuth routes...');

// OAuth callback routes are handled in auth.routes.ts
// But we also need routes without /api prefix for Google OAuth redirects
app.get("/auth/google/callback", (req, res, next) => {
  console.log('🔍 OAuth Google callback route hit:', req.url);
  passport.authenticate('google', { 
    failureRedirect: '/login',
    session: false 
  })(req, res, next);
}, async (req, res) => {
  // Import the socialAuthCallback function
  const { socialAuthCallback } = await import('./controllers/auth.controller.js');
  socialAuthCallback(req, res);
});

app.get("/auth/facebook/callback", (req, res, next) => {
  console.log('🔍 OAuth Facebook callback route hit:', req.url);
  passport.authenticate('facebook', { 
    failureRedirect: '/login',
    session: false 
  })(req, res, next);
}, async (req, res) => {
  // Import the socialAuthCallback function
  const { socialAuthCallback } = await import('./controllers/auth.controller.js');
  socialAuthCallback(req, res);
});

// OAuth initiation routes without /api prefix
app.get("/auth/google", (req, res, next) => {
  console.log('🔍 OAuth Google route hit:', req.url);
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })(req, res, next);
});

app.get("/auth/facebook", (req, res, next) => {
  console.log('🔍 OAuth Facebook route hit:', req.url);
  passport.authenticate('facebook', { 
    scope: ['public_profile'] 
  })(req, res, next);
});

// Test route for OAuth debugging
app.get("/auth/test", (_req: Request, res: Response) => {
  console.log('🔍 OAuth test route hit');
  res.json({ message: "OAuth routes are working!", timestamp: new Date().toISOString() });
});

console.log('✅ OAuth routes registered successfully');

// Use auth routes
app.use("/api/auth", authRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/payment', paymentRoutes);

// Public categories route (accessible to all users) - MUST be before admin routes
app.get('/api/categories', async (req: Request, res: Response) => {
  try {
    const { type, search } = req.query;
    let query: any = { isActive: true };
    
    if (type) {
      query.type = type;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const Category = (await import('./models/category')).Category;
    const categories = await Category.find(query).sort({ createdAt: -1 });
    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.use('/api/admin', adminRoutes);

app.use('/api/posts', postRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/chat', chatRoutes);

// JWT generator
const generateToken = (id: string): string => {
  const jwtSecret = process.env.JWT_SECRET || 'fallback-jwt-secret';
  return jwt.sign({ id }, jwtSecret, { expiresIn: "7d" });
};

// Auth middleware
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Check for token in cookies first, then in Authorization header
  let token = req.cookies.token;
  
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback-jwt-secret';
    const decoded = jwt.verify(token, jwtSecret) as { id: string };

    const user = await UserModel.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    (req as any).user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Routes
app.get("/", (_req: Request, res: Response) => {
  res.send("API is running!");
});

// Register
app.post("/api/auth/register", async (req: Request, res: Response) => {
  const { name, username, email, password } = req.body;

  const userExists = await UserModel.findOne({ email });
  if (userExists) return res.status(400).json({ message: "User already exists" });

  const usernameExists = await UserModel.findOne({ username });
  if (usernameExists) return res.status(400).json({ message: "Username already taken" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new UserModel({
    name,
    username,
    email,
    password: hashedPassword,
    tokens: 0,
  });

  await newUser.save();
  res.status(201).json({ token: generateToken(String(newUser._id)), user: newUser });
});

// Login
app.post("/api/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  if (!user.password) {
    return res.status(400).json({ message: "User password not set" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

  const token = generateToken(String(user._id));
  res
    .cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // or "strict"
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .json({
      token: token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        tokens: user.tokens,
      },
    });
});

// Profile
app.get("/api/auth/me", authMiddleware, (req: Request, res: Response) => {
  res.json((req as any).user);
});

// Get Tokens
app.get("/api/auth/tokens", authMiddleware, (req: Request, res: Response) => {
  res.json({ tokens: (req as any).user.tokens });
});

// Add Tokens
app.post("/api/auth/tokens/add", authMiddleware, async (req: Request, res: Response) => {
  const { amount } = req.body;
  const user = (req as any).user;

  user.tokens += amount;
  await user.save();

  res.json({ tokens: user.tokens });
});

// Use Tokens
app.post("/api/auth/tokens/use", authMiddleware, async (req: Request, res: Response) => {
  const { amount } = req.body;
  const user = (req as any).user;

  if (user.tokens < amount) {
    return res.status(400).json({ message: "Not enough tokens" });
  }

  user.tokens -= amount;
  await user.save();

  res.json({ tokens: user.tokens });
});

// Logout
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.json({ message: "Logged out" });
});

// Generate Image
app.post("/api/generate", authMiddleware, async (req, res) => {
  try {
    const { prompt, aspectRatio, category, type, categorySelections } = req.body;
    const user = (req as any).user;

    // 1. Check tokens
    if (user.tokens < 1) {
      return res.status(400).json({ message: "Not enough tokens" });
    }

    // 2. Deduct 1 token
    user.tokens -= 1;
    await user.save();

    // 3. Call Stability AI API
    const apiKey = process.env.STABILITY_API_KEY || "sk-YCIPirgXVCGX78tvpT4o7DHA81UgxXg5f5XqAtUt6KCCwR2k";
    if (!apiKey) {
      return res.status(500).json({ message: "Stability API key not set" });
    }

    // Determine width/height from aspectRatio
    let width = 1024;
    let height = 1024;
    if (aspectRatio) {
      if (aspectRatio === "2:3") {
        width = 832; height = 1216;
      } else if (aspectRatio === "3:2") {
        width = 1216; height = 832;
      } else if (aspectRatio === "3:4") {
        width = 896; height = 1152;
      } else if (aspectRatio === "4:3") {
        width = 1152; height = 896;
      } else if (aspectRatio === "1:1") {
        width = 1024; height = 1024;
      } else if (aspectRatio === "16:9") {
        width = 1344; height = 768;
      } else if (aspectRatio === "9:16") {
        width = 768; height = 1344;
      }
    }

    // Enhanced prompt with category context
    let enhancedPrompt = prompt;
    if (categorySelections && Object.keys(categorySelections).length > 0) {
      const categoryContext = Object.entries(categorySelections)
        .map(([categoryName, itemValue]) => `${categoryName}: ${itemValue}`)
        .join(', ');
      enhancedPrompt = `${prompt} ${categoryContext}`.trim();
    }

    const response = await axios.post(
      "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
      {
        text_prompts: [{ text: enhancedPrompt }],
        cfg_scale: 7,
        height,
        width,
        samples: 1,
        steps: 30,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const base64 = response.data.artifacts[0].base64;
    const imageUrl = `data:image/png;base64,${base64}`;

    res.json({ imageUrl });
  } catch (err) {
    console.error((err as any)?.response?.data || err);
    res.status(500).json({ message: "Failed to generate image" });
  }
});

// Generate Video
const upload = multer();
app.post(
  "/api/generate-video",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const user = (req as any).user;
      if (user.tokens < 1) {
        return res.status(400).json({ message: "Not enough tokens" });
      }
      user.tokens -= 1;
      await user.save();

      let imageBuffer: Buffer | null = null;
      let imageName = "uploaded.png";
      let categoryContext = "";

      if (req.file) {
        imageBuffer = req.file.buffer;
        imageName = req.file.originalname;
      } else {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Extract category context from form data
      if (req.body.categoryContext) {
        categoryContext = req.body.categoryContext;
      }

      const apiKey = process.env.STABILITY_API_KEY || "sk-YCIPirgXVCGX78tvpT4o7DHA81UgxXg5f5XqAtUt6KCCwR2k";
      console.log('Sending request to Stability AI video generation...');
      // Try alternative endpoint for video generation
      let startRes;
      let generationId;
      try {
        startRes = await axios.post(
          "https://api.stability.ai/v1/generation/stable-video-diffusion-img2vid-xt/image-to-video",
          {
            image: imageBuffer.toString('base64'),
            cfg_scale: 1.8,
            motion_bucket_id: 127,
            seed: 0
          },
          { 
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            }
          }
        );
        console.log('Stability AI response:', startRes.data);
        generationId = startRes.data.id;
      } catch (videoError) {
        console.error('Video generation failed, trying alternative approach...');
        // For now, return a placeholder response indicating video generation is not available
        return res.status(503).json({ 
          message: "Video generation service is currently unavailable. Please try again later.",
          error: "Stability AI video generation endpoint not accessible"
        });
      }
      let videoUrl = null;
      for (let i = 0; i < 60; i++) { // try for up to 60 seconds
        await new Promise((r) => setTimeout(r, 1000));
        const pollRes = await axios.get(
          `https://api.stability.ai/v1/generation/stable-video-diffusion-img2vid-xt/image-to-video/${generationId}`,
          { headers: { Authorization: `Bearer ${apiKey}` } }
        );
        console.log('Polling status:', pollRes.data);
        if (pollRes.data.status === "succeeded") {
          if (pollRes.data.artifacts && pollRes.data.artifacts[0]) {
            // New API format - artifacts array
            const artifact = pollRes.data.artifacts[0];
            if (artifact.base64) {
              videoUrl = `data:video/mp4;base64,${artifact.base64}`;
              break;
            }
          } else if (pollRes.data.video_url) {
            videoUrl = pollRes.data.video_url;
            break;
          } else if (pollRes.data.video) {
            // Return base64 video as a data URL
            videoUrl = `data:video/mp4;base64,${pollRes.data.video}`;
            break;
          }
        }
        if (pollRes.data.status === "failed") {
          return res
            .status(500)
            .json({ message: "Video generation failed", error: pollRes.data });
        }
      }
      if (!videoUrl) {
        return res
          .status(500)
          .json({ message: "Failed to generate video: No video URL returned" });
      }
      res.json({ videoUrl });
    } catch (err) {
      const errorData = (err as any)?.response?.data || err;
      console.error('Video generation error:', errorData);
      console.error('Error stack:', (err as any)?.stack);
      res
        .status(500)
        .json({ message: "Failed to generate video", error: JSON.stringify(errorData) });
    }
  }
);

// Catch-all route for debugging
app.use('*', (req: Request, res: Response) => {
  console.log('🔍 Catch-all route hit:', req.method, req.originalUrl);
  res.status(404).json({ 
    message: 'Route not found', 
    method: req.method, 
    url: req.originalUrl,
    availableRoutes: [
      '/',
      '/auth/test',
      '/auth/google',
      '/auth/google/callback',
      '/auth/facebook',
      '/auth/facebook/callback',
      '/api/auth/*',
      '/api/images/*',
      '/api/payment/*',
      '/api/categories',
      '/api/admin/*',
      '/api/posts/*',
      '/api/characters/*',
      '/api/chat/*'
    ]
  });
});

// Start server after DB connection
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('📋 Available routes:');
  console.log('  - /auth/test');
  console.log('  - /auth/google');
  console.log('  - /auth/google/callback');
  console.log('  - /auth/facebook');
  console.log('  - /auth/facebook/callback');
});