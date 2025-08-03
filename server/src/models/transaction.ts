import mongoose, { Schema, Document, Types } from "mongoose";

export enum TransactionType {
  IMAGE_UNLOCK = 'IMAGE_UNLOCK',
  TOKEN_PURCHASE = 'TOKEN_PURCHASE',
  ADMIN_CREDIT = 'ADMIN_CREDIT',
  OTHER = 'OTHER'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export interface ITransaction extends Document {
  user: Types.ObjectId;
  type: TransactionType;
  status: TransactionStatus;
  amount: number; // In cents (for payments) or tokens (for token transactions)
  currency: string; // ISO currency code (e.g., 'USD')
  description: string;
  metadata: {
    imageId?: Types.ObjectId;
    paymentMethod?: string;
    paymentGateway?: string;
    paymentId?: string;
    tokensBefore: number;
    tokensAfter: number;
    [key: string]: any;
  };
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema: Schema = new Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  type: { 
    type: String, 
    enum: Object.values(TransactionType),
    required: true 
  },
  status: { 
    type: String, 
    enum: Object.values(TransactionStatus),
    default: TransactionStatus.PENDING
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0 
  },
  currency: { 
    type: String, 
    default: 'USD',
    uppercase: true,
    trim: true 
  },
  description: { 
    type: String,
    trim: true,
    required: true 
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  processedAt: { 
    type: Date 
  }
}, { 
  timestamps: true,
  toJSON: {
    transform: function(doc, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for common queries
transactionSchema.index({ user: 1, type: 1, createdAt: -1 });
transactionSchema.index({ status: 1, createdAt: 1 });

// Pre-save hook to set processedAt when status changes to COMPLETED
transactionSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === TransactionStatus.COMPLETED && !this.processedAt) {
    this.processedAt = new Date();
  }
  next();
});

export const TransactionModel = mongoose.model<ITransaction>("Transaction", transactionSchema);
