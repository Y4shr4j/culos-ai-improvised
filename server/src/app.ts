import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/db";
import { UserModel, IUser } from "./models/user";
import { ImageModel } from "./models/image";
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
import videoRoutes from './routes/video.routes';
import { uploadToS3 } from "./utils/s3";

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

// OAuth routes are handled in auth.routes.ts
console.log('🔧 OAuth routes will be handled by auth.routes.ts');

// Use auth routes with /api prefix
app.use("/api/auth", authRoutes);

// Also mount auth routes without /api prefix for direct OAuth redirects
app.use("/auth", authRoutes);
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

// Test endpoint to check environment variables
app.get('/api/test-env', (req: Request, res: Response) => {
  res.json({
    awsRegion: process.env.AWS_REGION || 'NOT SET',
    awsBucket: process.env.AWS_S3_BUCKET || 'NOT SET',
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'NOT SET',
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET',
    stabilityApiKey: process.env.STABILITY_API_KEY ? 'SET' : 'NOT SET',
    nodeEnv: process.env.NODE_ENV || 'NOT SET',
    port: process.env.PORT || 'NOT SET'
  });
});

app.use('/api/admin', adminRoutes);

app.use('/api/posts', postRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/videos', videoRoutes);

// Diagnostic endpoint for debugging
app.get("/api/debug/config", (req: Request, res: Response) => {
  const config = {
    nodeEnv: process.env.NODE_ENV,
    hasStabilityKey: !!process.env.STABILITY_API_KEY,
    hasAwsAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
    hasAwsSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
    hasAwsRegion: !!process.env.AWS_REGION,
    hasAwsBucket: !!process.env.AWS_S3_BUCKET,
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasMongoUri: !!process.env.MONGODB_URI,
    stabilityKeyLength: process.env.STABILITY_API_KEY?.length || 0,
    awsAccessKeyLength: process.env.AWS_ACCESS_KEY_ID?.length || 0,
    awsSecretKeyLength: process.env.AWS_SECRET_ACCESS_KEY?.length || 0,
  };
  
  console.log('Debug config:', config);
  res.json(config);
});

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
  console.log('>>> /api/generate route hit <<<');
  console.log('Request body:', req.body);
  console.log('User:', (req as any).user);
  
  try {
    const { prompt, aspectRatio, category, type, categorySelections } = req.body;
    const user = (req as any).user;

    // Validate required fields
    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    // Check environment variables
    const apiKey = process.env.STABILITY_API_KEY;
    if (!apiKey) {
      console.error('STABILITY_API_KEY not set');
      return res.status(500).json({ message: "Stability API key not configured" });
    }

    const awsAccessKey = process.env.AWS_ACCESS_KEY_ID;
    const awsSecretKey = process.env.AWS_SECRET_ACCESS_KEY;
    const awsRegion = process.env.AWS_REGION;
    const awsBucket = process.env.AWS_S3_BUCKET;

    if (!awsAccessKey || !awsSecretKey || !awsRegion || !awsBucket) {
      console.error('AWS credentials not properly configured');
      return res.status(500).json({ message: "AWS S3 configuration incomplete" });
    }

    console.log('Processing image generation request...');
    console.log('Prompt:', prompt);
    console.log('Aspect ratio:', aspectRatio);
    console.log('Category:', category);
    console.log('Category selections:', categorySelections);

    // 1. Check tokens
    if (user.tokens < 1) {
      console.log('User has insufficient tokens:', user.tokens);
      return res.status(400).json({ message: "Not enough tokens" });
    }

    // 2. Deduct 1 token
    user.tokens -= 1;
    await user.save();
    console.log('Token deducted. New balance:', user.tokens);

    console.log('Calling Stability AI API...');

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

    console.log('Image dimensions:', width, 'x', height);

    // Enhanced prompt with category context
    let enhancedPrompt = prompt;
    if (categorySelections && Object.keys(categorySelections).length > 0) {
      const categoryContext = Object.entries(categorySelections)
        .map(([categoryName, itemValue]) => `${categoryName}: ${itemValue}`)
        .join(', ');
      enhancedPrompt = `${prompt} ${categoryContext}`.trim();
    }

    console.log('Enhanced prompt:', enhancedPrompt);

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

    console.log('Stability AI response received');
    const base64 = response.data.artifacts[0].base64;
    // Convert base64 to buffer
    const buffer = Buffer.from(base64, 'base64');
    console.log('Image buffer created, size:', buffer.length);
    
    // Upload to S3
    console.log('Uploading to S3...');
    const s3Url = await uploadToS3({
      originalname: `ai-generated-${Date.now()}.png`,
      mimetype: "image/png",
      buffer,
      size: buffer.length,
    }, 'images');

    console.log('S3 upload successful, URL:', s3Url);

    // Save the generated image with metadata
    try {
      const image = new ImageModel({
        url: s3Url,
        title: `AI Generated - ${prompt.substring(0, 50)}...`,
        description: prompt,
        prompt: prompt,
        categorySelections: categorySelections || {},
        category: category,
        tags: categorySelections ? Object.values(categorySelections) : [],
        isBlurred: false, // Generated images are unlocked by default
        blurIntensity: 0,
        uploadedBy: user._id,
        width: width,
        height: height,
        size: buffer.length,
        mimeType: "image/png",
        unlockPrice: 0, // Generated images are free
        unlockCount: 0,
        isActive: true // Make sure AI-generated images are active
      });

      await image.save();
      console.log('Image saved to database with ID:', image._id);
    } catch (saveError) {
      console.error('Error saving generated image:', saveError);
      // Don't fail the request if saving metadata fails
    }

    console.log('Image generation completed successfully');
    res.json({ imageUrl: s3Url });
  } catch (err) {
    console.error('>>> /api/generate ERROR <<<');
    console.error('Error details:', err);
    console.error('Error response:', (err as any)?.response?.data);
    console.error('Error status:', (err as any)?.response?.status);
    
    // Provide more specific error messages
    if ((err as any)?.response?.status === 401) {
      res.status(500).json({ message: "Invalid Stability AI API key" });
    } else if ((err as any)?.response?.status === 429) {
      res.status(500).json({ message: "Stability AI rate limit exceeded" });
    } else if ((err as any)?.response?.status === 400) {
      res.status(500).json({ message: "Invalid request to Stability AI" });
    } else {
      res.status(500).json({ message: "Failed to generate image", error: (err as any)?.message || 'Unknown error' });
    }
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

      const apiKey = process.env.STABILITY_API_KEY;
      if (!apiKey) {
        console.log('Stability API key not set for video generation');
        return res.status(500).json({ message: "Stability API key not set. Please configure STABILITY_API_KEY in your environment variables." });
      }
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
      '/api/test-env',
      '/api/generate',
      '/api/generate-video',
      '/api/admin/*',
      '/api/posts/*',
      '/api/characters/*',
      '/api/chat/*',
      '/api/videos/*'
    ]
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error handler caught:', err);
  console.error('Error stack:', err.stack);
  res.status(500).json({ 
    message: "Internal server error", 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Database: ${process.env.MONGODB_URI ? 'Configured' : 'Not configured'}`);
  console.log(`Stability AI: ${process.env.STABILITY_API_KEY ? 'Configured' : 'Not configured'}`);
  console.log(`AWS S3: ${process.env.AWS_ACCESS_KEY_ID ? 'Configured' : 'Not configured'}`);
});