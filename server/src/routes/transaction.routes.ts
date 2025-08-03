import express from 'express';
import { 
  purchaseTokens, 
  getTransactions, 
  getTransactionById,
  adminAddTokens
} from '../controllers/transaction.controller';
import { isAuthenticated, isAdmin } from '../middleware/auth';

const router = express.Router();

// Protected routes (require authentication)
router.post('/purchase-tokens', isAuthenticated, purchaseTokens);
router.get('/', isAuthenticated, getTransactions);
router.get('/:id', isAuthenticated, getTransactionById);

// Admin only routes
router.post('/admin/add-tokens', isAuthenticated, isAdmin, adminAddTokens);

export default router;
