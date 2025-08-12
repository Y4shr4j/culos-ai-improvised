import { Request, Response } from 'express';
import fetch from 'node-fetch';
import { UserModel } from '../models/user';
import { PaymentModel } from '../models/payment';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API = 'https://api-m.sandbox.paypal.com'; // Sandbox endpoint
// NOWPayments configuration
const NOWPAY_API_KEY = process.env.NOWPAYMENTS_API_KEY || 'ZHSK24Z-CX1MY43-JEJ6WGW-8EK5QAT';
const NOWPAY_PUBLIC_KEY = process.env.NOWPAYMENTS_PUBLIC_KEY || '11bbc341-3e33-40aa-a553-cb2c6a429972';
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
    console.log('Creating crypto invoice with:', req.body);
    const { packageId, amount, currency = 'USD' } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Create NOWPayments invoice
    console.log('Creating NOWPayments invoice...');
    
    // Use only the minimal required fields for NOWPayments
    const invoiceData: any = {
      price_amount: parseFloat(amount),
      price_currency: currency.toLowerCase(),
      order_id: `${packageId}_${req.user._id}_${Date.now()}`,
      order_description: `CulosAI ${packageId} - ${req.user.email}`
    };

    // Get environment variables
    const baseUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL;
    const backendUrl = process.env.BACKEND_URL;
    
    // Check if we're in production (not localhost)
    // Force local development mode if server is running on localhost
    const isLocalhost = req.get('host')?.includes('localhost') || req.get('host')?.includes('127.0.0.1');
    const isProduction = !isLocalhost && baseUrl && !baseUrl.includes('localhost') && !baseUrl.includes('127.0.0.1');
    
    console.log('Request host:', req.get('host'));
    console.log('Is localhost:', isLocalhost);
    console.log('Is production:', isProduction);
    
    if (isProduction) {
      // Use production URLs
      const cleanBaseUrl = baseUrl.replace(/\/$/, '');
      invoiceData.success_url = `${cleanBaseUrl}/payment/success?invoice_id={invoice_id}`;
      invoiceData.cancel_url = `${cleanBaseUrl}/payment/cancel`;
      invoiceData.partially_paid_url = `${cleanBaseUrl}/payment/partial`;
      invoiceData.is_fixed_rate = true;
      invoiceData.is_fee_paid_by_user = false;
      
      // Add webhook URL for production
      if (backendUrl && !backendUrl.includes('localhost') && !backendUrl.includes('127.0.0.1')) {
        const cleanBackendUrl = backendUrl.replace(/\/$/, '');
        invoiceData.ipn_callback_url = `${cleanBackendUrl}/api/payment/crypto/webhook`;
      }
    }
    // For local development, don't include any optional URLs - NOWPayments works fine without them

    console.log('NOWPayments invoice data:', JSON.stringify(invoiceData, null, 2));
    console.log('Is production:', isProduction);

    const resp = await fetch(`${NOWPAY_API}/invoice`, {
      method: 'POST',
      headers: {
        'x-api-key': NOWPAY_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invoiceData)
    });

    const data = await resp.json();
    console.log('NOWPayments response:', JSON.stringify(data, null, 2));

    if (!resp.ok) {
      console.error('NOWPayments error:', data);
      return res.status(500).json({ 
        error: 'Failed to create crypto invoice', 
        details: data,
        message: data.message || 'NOWPayments API error'
      });
    }

    // Calculate tokens to add
    const tokenMap: Record<string, number> = {
      '20-tokens': 20,
      '50-tokens': 50,
      '100-tokens': 100,
      '20': 20,
      '50': 50,
      '100': 100,
    };
    const tokensToAdd = tokenMap[packageId] || 0;

    // Store payment record
    const payment = new PaymentModel({
      userId: req.user._id,
      packageId,
      amount: parseFloat(amount),
      currency,
      paymentMethod: 'crypto',
      status: 'pending',
      provider: 'nowpayments',
      providerInvoiceId: data.id || data.invoice_id,
      providerOrderId: invoiceData.order_id,
      paymentUrl: data.invoice_url || data.pay_url,
      tokensAdded: tokensToAdd,
      metadata: data
    });

    await payment.save();
    console.log('Payment record saved:', payment._id);

    return res.json({ 
      id: data.id || data.invoice_id, 
      url: data.invoice_url || data.pay_url, 
      provider: 'nowpayments',
      orderId: invoiceData.order_id,
      status: data.status || 'pending',
      paymentId: payment._id
    });

  } catch (error) {
    console.error('Crypto invoice create error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to create crypto invoice', message: errorMessage });
  }
};

// POST /crypto/confirm
export const confirmCryptoPayment = async (req: Request, res: Response) => {
  try {
    console.log('Confirming crypto payment with:', req.body);
    const { invoiceId, packageId } = req.body as { invoiceId: string; packageId: string };
    
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!invoiceId) {
      return res.status(400).json({ error: 'Invoice ID is required' });
    }

    // Check payment status with NOWPayments
    console.log('Checking NOWPayments invoice status...');
    const resp = await fetch(`${NOWPAY_API}/invoice/${invoiceId}`, {
      headers: { 
        'x-api-key': NOWPAY_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const data = await resp.json();
    console.log('NOWPayments invoice status:', data);

    if (!resp.ok) {
      return res.status(500).json({ 
        error: 'Failed to check payment status', 
        details: data 
      });
    }

    const status = String((data.status || data.invoice_status || '')).toLowerCase();
    const isPaid = ['finished', 'confirmed', 'completed', 'paid'].includes(status);

    if (!isPaid) {
      return res.status(400).json({ 
        error: 'Payment not confirmed', 
        status: data.status || data.invoice_status,
        message: 'Payment is still pending or incomplete'
      });
    }

    // Find and update payment record
    const payment = await PaymentModel.findOne({ 
      providerInvoiceId: invoiceId,
      userId: req.user._id 
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    // Update payment status
    payment.status = 'completed';
    payment.metadata = { ...payment.metadata, confirmedAt: new Date(), confirmationData: data };
    await payment.save();

    // Credit tokens to user
    if (payment.tokensAdded > 0) {
      await UserModel.findByIdAndUpdate((req.user as any)._id, { $inc: { tokens: payment.tokensAdded } });
      console.log(`Added ${payment.tokensAdded} tokens to user ${req.user._id}`);
    }

    return res.json({ 
      message: 'Crypto payment confirmed', 
      tokensAdded: payment.tokensAdded,
      status: data.status,
      paymentAmount: data.pay_amount,
      paymentCurrency: data.pay_currency
    });

  } catch (error) {
    console.error('Crypto confirm error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to confirm crypto payment', message: errorMessage });
  }
};

// Webhook endpoint for NOWPayments IPN
export const cryptoWebhook = async (req: Request, res: Response) => {
  try {
    console.log('NOWPayments webhook received:', req.body);
    
    const { 
      payment_id, 
      payment_status, 
      pay_address, 
      price_amount, 
      price_currency, 
      pay_amount, 
      pay_currency, 
      order_id,
      invoice_id 
    } = req.body;

    // Verify webhook signature (recommended for production)
    // const signature = req.headers['x-nowpayments-sig'];
    // if (!verifyWebhookSignature(req.body, signature)) {
    //   return res.status(400).json({ error: 'Invalid signature' });
    // }

    // Find payment record
    const payment = await PaymentModel.findOne({ 
      providerInvoiceId: invoice_id || payment_id 
    });

    if (!payment) {
      console.error('Payment record not found for invoice:', invoice_id || payment_id);
      return res.status(404).json({ error: 'Payment record not found' });
    }

    // Update payment status
    const newStatus = payment_status === 'finished' || payment_status === 'confirmed' ? 'completed' : 'pending';
    payment.status = newStatus;
    payment.metadata = { 
      ...payment.metadata, 
      webhookReceivedAt: new Date(),
      webhookData: req.body
    };
    await payment.save();

    // Credit tokens if payment is completed
    if (newStatus === 'completed' && payment.tokensAdded > 0) {
      await UserModel.findByIdAndUpdate(payment.userId, { $inc: { tokens: payment.tokensAdded } });
      console.log(`Webhook: Added ${payment.tokensAdded} tokens to user ${payment.userId}`);
    }

    res.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};