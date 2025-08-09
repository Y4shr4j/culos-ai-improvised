import express from 'express';
import { createPaypalOrder, capturePaypalOrder, createCryptoInvoice, confirmCryptoPayment } from '../controllers/payment.controller';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

// Test endpoint to verify payment routes are working
router.get('/test', (req, res) => {
  res.json({ message: 'Payment routes are working' });
});

// Create PayPal order
router.post('/paypal/create-order', isAuthenticated, createPaypalOrder);
// Capture PayPal order
router.post('/paypal/capture-order', isAuthenticated, capturePaypalOrder);

// Crypto payments
router.post('/crypto/create-invoice', isAuthenticated, createCryptoInvoice);
router.post('/crypto/confirm', isAuthenticated, confirmCryptoPayment);

export default router; 