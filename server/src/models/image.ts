import mongoose, { Schema, Document, Types } from "mongoose";

export interface IImage extends Document {
  url: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  isBlurred: boolean;
  blurIntensity: number; // 0-100, where 0 is not blurred, 100 is fully blurred
  category?: string;
  tags: string[];
  uploadedBy: Types.ObjectId;
  width: number;
  height: number;
  size: number; // in bytes
  mimeType: string;
  metadata?: Record<string, any>;
  isActive: boolean;
  unlockPrice: number; // in tokens
  unlockCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const imageSchema: Schema = new Schema({
  url: { 
    type: String, 
    required: true,
    trim: true 
  },
  thumbnailUrl: { 
    type: String,
    trim: true 
  },
  title: { 
    type: String,
    trim: true 
  },
  description: { 
    type: String,
    trim: true 
  },
  isBlurred: { 
    type: Boolean, 
    default: true 
  },
  blurIntensity: { 
    type: Number, 
    default: 80, // Default blur intensity (0-100)
    min: 0,
    max: 100 
  },
  category: { 
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  uploadedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  width: { 
    type: Number,
    required: true
  },
  height: { 
    type: Number,
    required: true
  },
  size: { 
    type: Number, 
    required: true 
  },
  mimeType: { 
    type: String, 
    required: true 
  },
  metadata: { 
    type: Schema.Types.Mixed 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  unlockPrice: { 
    type: Number, 
    default: 1, // Default to 1 token per image
    min: 0 
  },
  unlockCount: { 
    type: Number, 
    default: 0 
  }
}, { 
  timestamps: true,
  toJSON: {
    transform: function(doc, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.metadata; // Don't expose all metadata by default
      return ret;
    }
  }
});

// Indexes for faster queries
imageSchema.index({ isBlurred: 1, isActive: 1 });
imageSchema.index({ category: 1, isActive: 1 });
imageSchema.index({ tags: 1, isActive: 1 });
imageSchema.index({ uploadedBy: 1, isActive: 1 });

export const ImageModel = mongoose.model<IImage>("Image", imageSchema);
