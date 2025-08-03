import { Request, Response } from 'express';
import { UserModel } from '../models/user';
import { TransactionModel, TransactionType, TransactionStatus } from '../models/transaction';
import { v4 as uuidv4 } from 'uuid';

// Mock payment processor - in a real app, integrate with Stripe, PayPal, etc.
const mockProcessPayment = async (amount: number, token: string) => {
  // In a real app, this would call the payment processor's API
  return {
    success: true,
    transactionId: `pmt_${uuidv4()}`,
    amount,
    currency: 'USD',
    status: 'succeeded'
  };
};

export const purchaseTokens = async (req: Request, res: Response) => {
  try {
    const { amount, paymentMethodId } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Validate amount (in cents)
    const tokenAmount = parseInt(amount);
    if (isNaN(tokenAmount) || tokenAmount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
    
    // Calculate cost (in cents) - $1 = 20 tokens
    const costInCents = Math.ceil((tokenAmount / 20) * 100);
    
    // Process payment
    const paymentResult = await mockProcessPayment(costInCents, paymentMethodId);
    
    if (!paymentResult.success) {
      // Create failed transaction record
      await TransactionModel.create({
        user: req.user._id,
        type: TransactionType.TOKEN_PURCHASE,
        status: TransactionStatus.FAILED,
        amount: tokenAmount,
        currency: paymentResult.currency,
        description: `Failed to purchase ${tokenAmount} tokens`,
        metadata: {
          paymentMethod: 'mock',
          paymentGateway: 'mock',
          paymentId: paymentResult.transactionId,
          tokensBefore: req.user.tokens,
          tokensAfter: req.user.tokens
        }
      });
      
      return res.status(400).json({ message: 'Payment failed' });
    }
    
    // Update user's token balance
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const tokensBefore = user.tokens;
    user.tokens += tokenAmount;
    await user.save();
    
    // Create successful transaction record
    const transaction = await TransactionModel.create({
      user: user._id,
      type: TransactionType.TOKEN_PURCHASE,
      status: TransactionStatus.COMPLETED,
      amount: tokenAmount,
      currency: paymentResult.currency,
      description: `Purchased ${tokenAmount} tokens`,
      metadata: {
        paymentMethod: 'mock',
        paymentGateway: 'mock',
        paymentId: paymentResult.transactionId,
        tokensBefore,
        tokensAfter: user.tokens
      }
    });
    
    res.json({
      message: 'Tokens purchased successfully',
      tokens: user.tokens,
      transaction
    });
  } catch (error) {
    console.error('Purchase tokens error:', error);
    res.status(500).json({ message: 'Error purchasing tokens' });
  }
};

export const getTransactions = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { page = 1, limit = 20, type } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const query: any = { user: req.user._id };
    
    if (type) {
      query.type = type;
    }
    
    const transactions = await TransactionModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await TransactionModel.countDocuments(query);
    
    res.json({
      transactions,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Error fetching transactions' });
  }
};

export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const transaction = await TransactionModel.findOne({
      _id: id,
      user: req.user._id
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ message: 'Error fetching transaction' });
  }
};

// Admin only
export const adminAddTokens = async (req: Request, res: Response) => {
  try {
    const { userId, amount, description } = req.body;
    
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
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
        adminId: req.user._id,
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
    console.error('Admin add tokens error:', error);
    res.status(500).json({ message: 'Error adding tokens' });
  }
};
