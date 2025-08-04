import mongoose, { Document, Schema } from 'mongoose';

export interface IAPISettings extends Document {
  // AI Providers
  aiProvider: 'gemini' | 'venice';
  geminiApiKey: string;
  veniceApiKey: string;
  
  // Image/Video Generation
  stabilityApiKey: string;
  
  // OAuth Providers
  googleClientId: string;
  googleClientSecret: string;
  facebookAppId: string;
  facebookAppSecret: string;
  
  // Payment Providers
  paypalClientId: string;
  paypalClientSecret: string;
  stripeSecretKey: string;
  stripePublishableKey: string;
  
  // Other Services
  mongodbUri: string;
  jwtSecret: string;
  
  // Metadata
  lastUpdated: Date;
  updatedBy: {
    name: string;
    email: string;
  };
}

const APISettingsSchema = new Schema<IAPISettings>({
  // AI Providers
  aiProvider: { 
    type: String, 
    enum: ['gemini', 'venice'], 
    default: 'gemini' 
  },
  geminiApiKey: { 
    type: String, 
    default: '' 
  },
  veniceApiKey: { 
    type: String, 
    default: '' 
  },
  
  // Image/Video Generation
  stabilityApiKey: { 
    type: String, 
    default: '' 
  },
  
  // OAuth Providers
  googleClientId: { 
    type: String, 
    default: '' 
  },
  googleClientSecret: { 
    type: String, 
    default: '' 
  },
  facebookAppId: { 
    type: String, 
    default: '' 
  },
  facebookAppSecret: { 
    type: String, 
    default: '' 
  },
  
  // Payment Providers
  paypalClientId: { 
    type: String, 
    default: '' 
  },
  paypalClientSecret: { 
    type: String, 
    default: '' 
  },
  stripeSecretKey: { 
    type: String, 
    default: '' 
  },
  stripePublishableKey: { 
    type: String, 
    default: '' 
  },
  
  // Other Services
  mongodbUri: { 
    type: String, 
    default: '' 
  },
  jwtSecret: { 
    type: String, 
    default: '' 
  },
  
  // Metadata
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  },
  updatedBy: {
    name: { type: String, required: true },
    email: { type: String, required: true }
  }
}, {
  timestamps: true
});

// Ensure only one document exists (singleton pattern)
APISettingsSchema.index({}, { unique: true });

export const APISettingsModel = mongoose.model<IAPISettings>('APISettings', APISettingsSchema); 