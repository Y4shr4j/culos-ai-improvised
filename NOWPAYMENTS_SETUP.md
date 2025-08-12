# NOWPayments Crypto Payment Integration Setup

## 🎯 Overview
This guide will help you set up NOWPayments crypto payment integration for your CulosAI application.

## 📋 Prerequisites
- NOWPayments account and API key: `P2JV2BC-RQ4MH0S-G4S2TM1-51KBJC7`
- Railway deployment with environment variables configured
- Domain for webhook URLs

## 🔧 Environment Variables

### Required Environment Variables
Add these to your Railway environment variables:

```bash
# NOWPayments API Key
NOWPAYMENTS_API_KEY=P2JV2BC-RQ4MH0S-G4S2TM1-51KBJC7

# Frontend URLs (for success/cancel redirects)
FRONTEND_URL=https://your-domain.com
CLIENT_URL=https://your-domain.com

# Backend URL (for webhooks)
BACKEND_URL=https://culosai-production.up.railway.app
```

## 🚀 API Endpoints

### 1. Create Crypto Invoice
```http
POST /api/payment/crypto/create-invoice
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "packageId": "20-tokens",
  "amount": "5.00",
  "currency": "USD"
}
```

**Response:**
```json
{
  "id": "invoice_id",
  "url": "payment_url",
  "provider": "nowpayments",
  "orderId": "order_id",
  "status": "pending",
  "paymentId": "payment_record_id"
}
```

### 2. Confirm Payment
```http
POST /api/payment/crypto/confirm
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "invoiceId": "invoice_id",
  "packageId": "20-tokens"
}
```

### 3. Webhook (IPN)
```http
POST /api/payment/crypto/webhook
Content-Type: application/json

{
  "payment_id": "payment_id",
  "payment_status": "finished",
  "pay_amount": "0.001",
  "pay_currency": "btc",
  "invoice_id": "invoice_id"
}
```

## 🧪 Testing Locally

1. **Start the server:**
```bash
cd server
npm run dev
```

2. **Run the test script:**
```bash
node test-nowpayments.js
```

3. **Test manually:**
```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","username":"test","email":"test@example.com","password":"Test1234!"}'

# Create invoice
curl -X POST http://localhost:5000/api/payment/crypto/create-invoice \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"packageId":"20-tokens","amount":"5.00","currency":"USD"}'
```

## 🌐 Production Setup

### 1. Railway Environment Variables
Set these in your Railway dashboard:
- `NOWPAYMENTS_API_KEY`: Your NOWPayments API key
- `FRONTEND_URL`: Your frontend domain
- `CLIENT_URL`: Your frontend domain
- `BACKEND_URL`: Your Railway backend URL

### 2. NOWPayments Dashboard Configuration

#### Webhook URL
Set the webhook URL in NOWPayments dashboard:
```
https://culosai-production.up.railway.app/api/payment/crypto/webhook
```

#### IPN Settings
- Enable IPN (Instant Payment Notifications)
- Set IPN URL to the webhook URL above
- Enable all payment status notifications

### 3. Domain Verification
For domain verification, choose one method:

#### Option A: Meta Tag
Add to your `client/index.html`:
```html
<head>
  <meta name="nowpayments-verification" content="YOUR_VERIFICATION_CODE">
</head>
```

#### Option B: HTML File
Create `client/public/nowpayments-verification.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <title>NOWPayments Verification</title>
</head>
<body>
  <h1>NOWPayments Domain Verification</h1>
  <p>Verification Code: YOUR_VERIFICATION_CODE</p>
</body>
</html>
```

## 💰 Token Packages

The system supports these token packages:

| Package ID | Tokens | Price (USD) |
|------------|--------|-------------|
| `20-tokens` | 20 | $5.00 |
| `50-tokens` | 50 | $10.00 |
| `100-tokens` | 100 | $18.00 |

## 🔄 Payment Flow

1. **User selects package** → Frontend calls `/create-invoice`
2. **Invoice created** → NOWPayments returns payment URL
3. **User redirected** → To NOWPayments payment page
4. **Payment made** → User pays with crypto
5. **Webhook received** → NOWPayments notifies your server
6. **Tokens credited** → User receives tokens automatically
7. **Success redirect** → User redirected to success page

## 📊 Payment Tracking

All payments are tracked in the `Payment` model with:
- User ID
- Package details
- Payment status
- Provider information
- Transaction metadata

## 🛡️ Security Features

- **Authentication required** for invoice creation
- **Payment verification** before token crediting
- **Webhook signature verification** (recommended for production)
- **Duplicate payment prevention** via payment records

## 🐛 Troubleshooting

### Common Issues

1. **"API key not configured"**
   - Check `NOWPAYMENTS_API_KEY` environment variable
   - Verify API key is valid in NOWPayments dashboard

2. **"Webhook not received"**
   - Check webhook URL is accessible
   - Verify IPN settings in NOWPayments dashboard
   - Check server logs for webhook errors

3. **"Payment not confirmed"**
   - Payment may still be pending
   - Check payment status in NOWPayments dashboard
   - Verify webhook is processing correctly

4. **"Tokens not credited"**
   - Check payment status is "finished" or "confirmed"
   - Verify user authentication
   - Check database for payment records

### Debug Commands

```bash
# Check environment variables
curl https://culosai-production.up.railway.app/api/test-env

# Check payment routes
curl https://culosai-production.up.railway.app/api/payment/test

# View Railway logs
railway logs
```

## 📞 Support

- **NOWPayments Support**: https://nowpayments.io/support
- **API Documentation**: https://documenter.getpostman.com/view/7907941/S1a33n38
- **Webhook Guide**: https://nowpayments.io/docs/webhooks

## 🎉 Success!

Once configured, users can:
1. Select a token package
2. Pay with cryptocurrency
3. Receive tokens automatically
4. Use tokens for AI image generation

The integration is now ready for production use!
