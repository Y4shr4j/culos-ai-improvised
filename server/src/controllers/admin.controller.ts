import { Request, Response } from 'express';
import { UserModel } from '../models/user';
import { TransactionModel, TransactionType, TransactionStatus } from '../models/transaction';
import { ImageModel } from '../models/image';

// Get all users with pagination and search
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;

    const skip = (page - 1) * limit;
    
    // Build query
    let query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      if (status === 'active') {
        query.isActive = true;
      } else if (status === 'inactive') {
        query.isActive = false;
      }
    }

    const users = await UserModel.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await UserModel.countDocuments(query);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's transaction history
    const transactions = await TransactionModel.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get user's unlocked images
    const unlockedImages = await ImageModel.find({
      _id: { $in: user.unlockedImages.map((img: any) => img.imageId) }
    });

    res.json({
      user,
      transactions,
      unlockedImages
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
};

// Update user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { name, email, username, isAdmin, isActive } = req.body;
    
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (username) user.username = username;
    if (typeof isAdmin === 'boolean') user.isAdmin = isAdmin;
    // @ts-ignore - Add isActive to user model if not exists
    if (typeof isActive === 'boolean') user.isActive = isActive;

    await user.save();

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is trying to delete themselves
    if (String(user._id) === String(req.user?._id)) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await UserModel.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

// Add tokens to user (admin function)
export const addTokensToUser = async (req: Request, res: Response) => {
  try {
    const { amount, description } = req.body;
    const userId = req.params.id;
    
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const tokensToAdd = parseInt(amount);
    if (isNaN(tokensToAdd) || tokensToAdd <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
    
    const tokensBefore = user.tokens;
    user.tokens += tokensToAdd;
    await user.save();
    
    // Create transaction record
    const transaction = await TransactionModel.create({
      user: user._id,
      type: TransactionType.ADMIN_CREDIT,
      status: TransactionStatus.COMPLETED,
      amount: tokensToAdd,
      currency: 'USD',
      description: description || `Admin credit: ${tokensToAdd} tokens`,
      metadata: {
        adminId: req.user?._id,
        tokensBefore,
        tokensAfter: user.tokens
      }
    });
    
    res.json({
      message: 'Tokens added successfully',
      userId: user._id,
      tokens: user.tokens,
      transaction
    });
  } catch (error) {
    console.error('Add tokens to user error:', error);
    res.status(500).json({ message: 'Error adding tokens' });
  }
};

// Get admin dashboard stats
export const getAdminStats = async (req: Request, res: Response) => {
  try {
    // Get total users
    const totalUsers = await UserModel.countDocuments();
    
    // Get users created in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await UserModel.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Get total images
    const totalImages = await ImageModel.countDocuments();
    
    // Get blurred images
    const blurredImages = await ImageModel.countDocuments({ isBlurred: true });
    
    // Get total transactions
    const totalTransactions = await TransactionModel.countDocuments();
    
    // Get revenue (sum of all completed purchases)
    const revenue = await TransactionModel.aggregate([
      {
        $match: {
          type: (TransactionType as any).PURCHASE,
          status: TransactionStatus.COMPLETED
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    // Get recent activity
    const recentTransactions = await TransactionModel.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get user growth over time (last 7 days)
    const userGrowth = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      
      const count = await UserModel.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });
      
      userGrowth.push({
        date: startOfDay.toISOString().split('T')[0],
        count
      });
    }
    
    res.json({
      stats: {
        totalUsers,
        newUsers,
        totalImages,
        blurredImages,
        totalTransactions,
        revenue: revenue[0]?.total || 0
      },
      recentTransactions,
      userGrowth
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

// Get transaction history
export const getTransactionHistory = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    
    const transactions = await TransactionModel.find()
      .populate('user', 'name email username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await TransactionModel.countDocuments();
    
    res.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({ message: 'Error fetching transactions' });
  }
}; 