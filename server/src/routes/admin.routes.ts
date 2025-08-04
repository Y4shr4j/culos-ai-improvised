import express from 'express';
import mongoose from 'mongoose';
import { 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser, 
  addTokensToUser,
  getAdminStats,
  getTransactionHistory
} from '../controllers/admin.controller';
import { isAuthenticated, isAdmin } from '../middleware/auth';
import { Category } from '../models/category';
import { TokenConfig } from '../models/tokenConfig';
import { AIConfig } from '../models/aiConfig';
import { ChatCharacterModel } from '../models/chatCharacter';
import { APISettingsModel } from '../models/apiSettings';

const router = express.Router();

// All routes require admin authentication
router.use(isAuthenticated, isAdmin);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Token management
router.post('/users/:id/tokens', addTokensToUser);

// Analytics and stats
router.get('/stats', getAdminStats);
router.get('/transactions', getTransactionHistory);

// Category management
router.get('/categories', async (req, res) => {
  try {
    const { type, search } = req.query;
    let query: any = { isActive: true };
    
    if (type) {
      query.type = type;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const categories = await Category.find(query).sort({ createdAt: -1 });
    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new category
router.post('/categories', async (req, res) => {
  try {
    const { name, type, description } = req.body;
    const user = req.user as any;
    
    const category = new Category({
      name,
      type,
      description,
      createdBy: {
        name: user.name,
        email: user.email
      }
    });
    
    await category.save();
    res.status(201).json({ category });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update category
router.put('/categories/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    );
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ category });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete category
router.delete('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add item to category
router.post('/categories/:id/items', async (req, res) => {
  try {
    console.log('Adding item to category:', req.params.id);
    console.log('Request body:', req.body);
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }
    
    const { name, value, description } = req.body;
    const user = req.user as any;
    
    console.log('User:', user);
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      console.log('Category not found:', req.params.id);
      return res.status(404).json({ message: 'Category not found' });
    }
    
    console.log('Found category:', category.name);
    
    const newItem = {
      name,
      value,
      description,
      createdBy: {
        name: user.name,
        email: user.email
      }
    };
    
    console.log('New item to add:', newItem);
    
    // Use $push to add item to the array
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { $push: { items: newItem } },
      { new: true }
    );
    
    console.log('Category updated successfully:', updatedCategory);
    
    res.status(201).json({ category: updatedCategory });
  } catch (error) {
    console.error('Error adding item to category:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Update item in category
router.put('/categories/:categoryId/items/:itemId', async (req, res) => {
  try {
    const { name, value, description } = req.body;
    
    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(req.params.categoryId) || !mongoose.Types.ObjectId.isValid(req.params.itemId)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }
    
    const updatedCategory = await Category.findOneAndUpdate(
      { 
        _id: req.params.categoryId,
        'items._id': req.params.itemId 
      },
      {
        $set: {
          'items.$.name': name,
          'items.$.value': value,
          'items.$.description': description
        }
      },
      { new: true }
    );
    
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category or item not found' });
    }
    
    res.json({ category: updatedCategory });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete item from category
router.delete('/categories/:categoryId/items/:itemId', async (req, res) => {
  try {
    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(req.params.categoryId) || !mongoose.Types.ObjectId.isValid(req.params.itemId)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }
    
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.categoryId,
      { $pull: { items: { _id: req.params.itemId } } },
      { new: true }
    );
    
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ message: 'Item deleted successfully', category: updatedCategory });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Token Configuration Routes
router.get('/token-config', async (req, res) => {
  try {
    let config = await TokenConfig.findOne();
    
    // If no config exists, create default one
    if (!config) {
      config = new TokenConfig({ tokenPrice: 0.05 });
      await config.save();
    }
    
    res.json({ tokenPrice: config.tokenPrice });
  } catch (error) {
    console.error('Error fetching token config:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/token-config', async (req, res) => {
  try {
    const { tokenPrice } = req.body;
    
    if (typeof tokenPrice !== 'number' || tokenPrice < 0) {
      return res.status(400).json({ message: 'Invalid token price' });
    }
    
    let config = await TokenConfig.findOne();
    
    if (!config) {
      config = new TokenConfig({ tokenPrice });
    } else {
      config.tokenPrice = tokenPrice;
    }
    
    await config.save();
    
    res.json({ tokenPrice: config.tokenPrice });
  } catch (error) {
    console.error('Error updating token config:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// AI Configuration routes
router.get('/ai-config', async (req, res) => {
  try {
    const aiConfig = await AIConfig.findOne({}) || await AIConfig.create({
      provider: 'gemini',
      geminiApiKey: process.env.GEMINI_API_KEY || "",
      veniceApiKey: process.env.VENICE_API_KEY || ""
    });
    
    res.json({
      provider: aiConfig.provider,
      geminiApiKey: aiConfig.geminiApiKey ? '***' + aiConfig.geminiApiKey.slice(-4) : '',
      veniceApiKey: aiConfig.veniceApiKey ? '***' + aiConfig.veniceApiKey.slice(-4) : ''
    });
  } catch (error) {
    console.error('Error fetching AI config:', error);
    res.status(500).json({ message: 'Failed to fetch AI configuration' });
  }
});

router.post('/ai-config', async (req, res) => {
  try {
    const { provider, geminiApiKey, veniceApiKey } = req.body;
    
    if (!provider || !['gemini', 'venice'].includes(provider)) {
      return res.status(400).json({ message: 'Invalid provider. Must be "gemini" or "venice"' });
    }

    let aiConfig = await AIConfig.findOne({});
    
    if (!aiConfig) {
      aiConfig = new AIConfig({
        provider,
        geminiApiKey: geminiApiKey || process.env.GEMINI_API_KEY || "",
        veniceApiKey: veniceApiKey || process.env.VENICE_API_KEY || ""
      });
    } else {
      aiConfig.provider = provider;
      if (geminiApiKey) aiConfig.geminiApiKey = geminiApiKey;
      if (veniceApiKey) aiConfig.veniceApiKey = veniceApiKey;
    }

    await aiConfig.save();
    
    res.json({ 
      message: 'AI configuration updated successfully',
      provider: aiConfig.provider,
      geminiApiKey: aiConfig.geminiApiKey ? '***' + aiConfig.geminiApiKey.slice(-4) : '',
      veniceApiKey: aiConfig.veniceApiKey ? '***' + aiConfig.veniceApiKey.slice(-4) : ''
    });
  } catch (error) {
    console.error('Error updating AI config:', error);
    res.status(500).json({ message: 'Failed to update AI configuration' });
  }
});

// Chat Character Management Routes
router.get('/characters', async (req, res) => {
  try {
    const { category, search, isActive } = req.query;
    let query: any = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    const characters = await ChatCharacterModel.find(query).sort({ createdAt: -1 });
    res.json({ characters });
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/characters', async (req, res) => {
  try {
    const { name, personality, traits, description, avatar, systemPrompt, category } = req.body;
    const user = req.user as any;
    
    if (!name || !personality || !description || !avatar || !systemPrompt) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const character = new ChatCharacterModel({
      id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      personality,
      traits: traits || [],
      description,
      avatar,
      systemPrompt,
      category: category || 'General',
      isActive: true,
      createdBy: {
        name: user?.name || 'Admin',
        email: user?.email || 'admin@culosai.com'
      }
    });
    
    await character.save();
    res.status(201).json({ character });
  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/characters/:id', async (req, res) => {
  try {
    const { name, personality, traits, description, avatar, systemPrompt, category, isActive } = req.body;
    
    const character = await ChatCharacterModel.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        personality, 
        traits, 
        description, 
        avatar, 
        systemPrompt, 
        category,
        isActive 
      },
      { new: true }
    );
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    res.json({ character });
  } catch (error) {
    console.error('Error updating character:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/characters/:id', async (req, res) => {
  try {
    const character = await ChatCharacterModel.findByIdAndDelete(req.params.id);
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    res.json({ message: 'Character deleted successfully' });
  } catch (error) {
    console.error('Error deleting character:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get character categories for filtering
router.get('/character-categories', async (req, res) => {
  try {
    const categories = await ChatCharacterModel.distinct('category');
    res.json({ categories });
  } catch (error) {
    console.error('Error fetching character categories:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API Settings Routes
router.get('/api-settings', async (req, res) => {
  try {
    let settings = await APISettingsModel.findOne();
    
    if (!settings) {
      // Create default settings if none exist
      settings = new APISettingsModel({
        updatedBy: {
          name: 'System',
          email: 'system@culosai.com'
        }
      });
      await settings.save();
    }
    
    // Mask sensitive data for security
    const maskedSettings = {
      aiProvider: settings.aiProvider,
      geminiApiKey: settings.geminiApiKey ? '***' + settings.geminiApiKey.slice(-4) : '',
      veniceApiKey: settings.veniceApiKey ? '***' + settings.veniceApiKey.slice(-4) : '',
      stabilityApiKey: settings.stabilityApiKey ? '***' + settings.stabilityApiKey.slice(-4) : '',
      googleClientId: settings.googleClientId ? '***' + settings.googleClientId.slice(-4) : '',
      googleClientSecret: settings.googleClientSecret ? '***' + settings.googleClientSecret.slice(-4) : '',
      facebookAppId: settings.facebookAppId ? '***' + settings.facebookAppId.slice(-4) : '',
      facebookAppSecret: settings.facebookAppSecret ? '***' + settings.facebookAppSecret.slice(-4) : '',
      paypalClientId: settings.paypalClientId ? '***' + settings.paypalClientId.slice(-4) : '',
      paypalClientSecret: settings.paypalClientSecret ? '***' + settings.paypalClientSecret.slice(-4) : '',
      stripeSecretKey: settings.stripeSecretKey ? '***' + settings.stripeSecretKey.slice(-4) : '',
      stripePublishableKey: settings.stripePublishableKey ? '***' + settings.stripePublishableKey.slice(-4) : '',
      mongodbUri: settings.mongodbUri ? '***' + settings.mongodbUri.slice(-4) : '',
      jwtSecret: settings.jwtSecret ? '***' + settings.jwtSecret.slice(-4) : '',
      lastUpdated: settings.lastUpdated,
      updatedBy: settings.updatedBy
    };
    
    res.json({ settings: maskedSettings });
  } catch (error) {
    console.error('Error fetching API settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/api-settings', async (req, res) => {
  try {
    const {
      aiProvider,
      geminiApiKey,
      veniceApiKey,
      stabilityApiKey,
      googleClientId,
      googleClientSecret,
      facebookAppId,
      facebookAppSecret,
      paypalClientId,
      paypalClientSecret,
      stripeSecretKey,
      stripePublishableKey,
      mongodbUri,
      jwtSecret
    } = req.body;
    
    const user = req.user as any;
    
    let settings = await APISettingsModel.findOne();
    
    if (!settings) {
      settings = new APISettingsModel({
        updatedBy: {
          name: user?.name || 'Admin',
          email: user?.email || 'admin@culosai.com'
        }
      });
    }
    
    // Update only provided fields (don't overwrite with empty strings)
    if (aiProvider !== undefined) settings.aiProvider = aiProvider;
    if (geminiApiKey !== undefined && geminiApiKey !== '') settings.geminiApiKey = geminiApiKey;
    if (veniceApiKey !== undefined && veniceApiKey !== '') settings.veniceApiKey = veniceApiKey;
    if (stabilityApiKey !== undefined && stabilityApiKey !== '') settings.stabilityApiKey = stabilityApiKey;
    if (googleClientId !== undefined && googleClientId !== '') settings.googleClientId = googleClientId;
    if (googleClientSecret !== undefined && googleClientSecret !== '') settings.googleClientSecret = googleClientSecret;
    if (facebookAppId !== undefined && facebookAppId !== '') settings.facebookAppId = facebookAppId;
    if (facebookAppSecret !== undefined && facebookAppSecret !== '') settings.facebookAppSecret = facebookAppSecret;
    if (paypalClientId !== undefined && paypalClientId !== '') settings.paypalClientId = paypalClientId;
    if (paypalClientSecret !== undefined && paypalClientSecret !== '') settings.paypalClientSecret = paypalClientSecret;
    if (stripeSecretKey !== undefined && stripeSecretKey !== '') settings.stripeSecretKey = stripeSecretKey;
    if (stripePublishableKey !== undefined && stripePublishableKey !== '') settings.stripePublishableKey = stripePublishableKey;
    if (mongodbUri !== undefined && mongodbUri !== '') settings.mongodbUri = mongodbUri;
    if (jwtSecret !== undefined && jwtSecret !== '') settings.jwtSecret = jwtSecret;
    
    settings.lastUpdated = new Date();
    settings.updatedBy = {
      name: user?.name || 'Admin',
      email: user?.email || 'admin@culosai.com'
    };
    
    await settings.save();
    
    res.json({ 
      message: 'API settings updated successfully',
      lastUpdated: settings.lastUpdated,
      updatedBy: settings.updatedBy
    });
  } catch (error) {
    console.error('Error updating API settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 