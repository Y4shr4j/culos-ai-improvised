import mongoose, { Document, Schema } from 'mongoose';

export interface IAIConfig extends Document {
  provider: 'gemini' | 'venice';
  geminiApiKey: string;
  veniceApiKey: string;
  createdAt: Date;
  updatedAt: Date;
}

const AIConfigSchema = new Schema<IAIConfig>({
  provider: { 
    type: String, 
    required: true, 
    enum: ['gemini', 'venice'], 
    default: 'gemini' 
  },
  geminiApiKey: { 
    type: String, 
    required: true,
    default: process.env.GEMINI_API_KEY || ""
  },
  veniceApiKey: { 
    type: String, 
    required: true,
    default: process.env.VENICE_API_KEY || ""
  }
}, {
  timestamps: true
});

// Ensure only one document exists
AIConfigSchema.index({}, { unique: true });

export const AIConfig = mongoose.model<IAIConfig>('AIConfig', AIConfigSchema); 