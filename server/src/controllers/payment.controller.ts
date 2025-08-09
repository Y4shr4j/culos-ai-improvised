import { Request, Response } from 'express';
import fetch from 'node-fetch';
import { UserModel } from '../models/user';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API = 'https://api-m.sandbox.paypal.com'; // Sandbox endpoint
const NOWPAY_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const NOWPAY_API = 'https://api.nowpayments.io/v1';

// Helper to get PayPal access token
async function getPaypalAccessToken() {
  try {
    console.log('Getting PayPal access token...');
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    const data = await res.json();
    console.log('PayPal access token response:', data);
    if (data.error) {
      throw new Error(`PayPal auth error: ${data.error_description || data.error}`);
    }
    return data.access_token;
  } catch (error) {
    console.error('Error getting PayPal access token:', error);
    throw error;
  }
}

// POST /paypal/create-order
export const createPaypalOrder = async (req: Request, res: Response) => {
  try {
    console.log('Creating PayPal order with:', req.body);
    const { packageId, amount, currency = 'USD' } = req.body;
    
    // Check if PayPal credentials are configured
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      console.error('PayPal credentials not configured');
      return res.status(500).json({ error: 'PayPal is not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables.' });
    }
    
    const accessToken = await getPaypalAccessToken();
    const orderRes = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount,
            },
            custom_id: packageId,
          },
        ],
      }),
    });
    const order = await orderRes.json();
    res.json(order);
  } catch (error) {
    console.error('PayPal create order error:', error);
    res.status(500).json({ error: 'Failed to create PayPal order' });
  }
};

// POST /paypal/capture-order
export const capturePaypalOrder = async (req: Request, res: Response) => {
  try {
    console.log('Capturing PayPal order with:', req.body);
    const { orderID, packageId } = req.body;
    
    // Check if PayPal credentials are configured
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      console.error('PayPal credentials not configured');
      return res.status(500).json({ error: 'PayPal is not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables.' });
    }
    const accessToken = await getPaypalAccessToken();
    const captureRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    const captureData = await captureRes.json();
    // Credit tokens to user if payment is completed
    if (captureData.status === 'COMPLETED') {
      // Example: map packageId to token amount
      const tokenMap: Record<string, number> = {
        '20-tokens': 20,
        '50-tokens': 50,
        '100-tokens': 100,
      };
      const tokensToAdd = tokenMap[packageId] || 0;
      if (tokensToAdd > 0 && req.user) {
        await UserModel.findByIdAndUpdate(req.user._id, { $inc: { tokens: tokensToAdd } });
      }
    }
    res.json(captureData);
  } catch (error) {
    console.error('PayPal capture order error:', error);
    res.status(500).json({ error: 'Failed to capture PayPal order' });
  }
};

// POST /crypto/create-invoice
export const createCryptoInvoice = async (req: Request, res: Response) => {
  try {
    const { packageId, amount, currency = 'USD' } = req.body;

    // If NOWPayments is configured, create real invoice
    if (NOWPAY_API_KEY) {
      const resp = await fetch(`${NOWPAY_API}/invoice`, {
        method: 'POST',
        headers: {
          'x-api-key': NOWPAY_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          price_amount: amount,
          price_currency: currency,
          order_id: packageId,
          order_description: `CulosAI package ${packageId}`,
          success_url: process.env.FRONTEND_URL || process.env.CLIENT_URL || '',
          cancel_url: process.env.FRONTEND_URL || process.env.CLIENT_URL || ''
        })
      });
      const data = await resp.json();
      if (!resp.ok) {
        return res.status(500).json({ error: 'Failed to create crypto invoice', details: data });
      }
      return res.json({ id: data.id || data.invoice_id, url: data.invoice_url || data.pay_url, provider: 'nowpayments' });
    }

    // Fallback demo invoice when no provider is configured
    const id = `demo_${Date.now()}`;
    const url = `${process.env.FRONTEND_URL || ''}/?invoice=${id}`;
    return res.json({ id, url, provider: 'demo' });
  } catch (error) {
    console.error('Crypto invoice create error:', error);
    res.status(500).json({ error: 'Failed to create crypto invoice' });
  }
};

// POST /crypto/confirm
export const confirmCryptoPayment = async (req: Request, res: Response) => {
  try {
    const { invoiceId, packageId } = req.body as { invoiceId: string; packageId: string };
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    let isPaid = true;
    if (NOWPAY_API_KEY && invoiceId) {
      const resp = await fetch(`${NOWPAY_API}/invoice/${invoiceId}`, {
        headers: { 'x-api-key': NOWPAY_API_KEY }
      });
      const data = await resp.json();
      const status = String((data.status || data.invoice_status || '')).toLowerCase();
      isPaid = ['finished', 'confirmed', 'completed', 'paid'].includes(status);
      if (!isPaid) {
        return res.status(400).json({ error: 'Payment not confirmed', status: data.status || data.invoice_status });
      }
    }

    // Credit tokens
    const tokenMap: Record<string, number> = {
      '20-tokens': 20,
      '50-tokens': 50,
      '100-tokens': 100,
    };
    const tokensToAdd = tokenMap[packageId] || 0;
    if (tokensToAdd > 0) {
      await UserModel.findByIdAndUpdate((req.user as any)._id, { $inc: { tokens: tokensToAdd } });
    }
    return res.json({ message: 'Crypto payment confirmed', tokensAdded: tokensToAdd });
  } catch (error) {
    console.error('Crypto confirm error:', error);
    res.status(500).json({ error: 'Failed to confirm crypto payment' });
  }
};