import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPayment extends Document {
  userId: Types.ObjectId;
  packageId: string;
  amount: number;
  currency: string;
  paymentMethod: 'crypto' | 'paypal';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  provider: 'nowpayments' | 'paypal';
  providerInvoiceId?: string;
  providerOrderId?: string;
  paymentUrl?: string;
  tokensAdded: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  packageId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  paymentMethod: {
    type: String,
    enum: ['crypto', 'paypal'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  provider: {
    type: String,
    enum: ['nowpayments', 'paypal'],
    required: true
  },
  providerInvoiceId: {
    type: String
  },
  providerOrderId: {
    type: String
  },
  paymentUrl: {
    type: String
  },
  tokensAdded: {
    type: Number,
    default: 0
  },
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for faster queries
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ providerInvoiceId: 1 });
paymentSchema.index({ status: 1 });

export const PaymentModel = mongoose.model<IPayment>('Payment', paymentSchema);
