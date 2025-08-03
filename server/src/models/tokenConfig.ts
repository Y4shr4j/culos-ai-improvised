import mongoose, { Schema, Document } from 'mongoose';

export interface ITokenConfig extends Document {
  tokenPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

const TokenConfigSchema = new Schema<ITokenConfig>({
  tokenPrice: {
    type: Number,
    required: true,
    default: 0.05,
    min: 0
  }
}, {
  timestamps: true
});

// Ensure only one document exists
TokenConfigSchema.index({}, { unique: true });

export const TokenConfig = mongoose.model<ITokenConfig>('TokenConfig', TokenConfigSchema); 