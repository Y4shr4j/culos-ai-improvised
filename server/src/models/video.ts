import mongoose, { Schema, Document, Types } from "mongoose";

export interface IVideo extends Document {
  url: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  prompt?: string; // For AI-generated videos
  categorySelections?: Record<string, any>; // For AI-generated videos
  isBlurred: boolean;
  blurIntensity: number; // 0-100, where 0 is not blurred, 100 is fully blurred
  category?: string;
  tags: string[];
  uploadedBy: Types.ObjectId;
  duration: number; // in seconds
  size: number; // in bytes
  mimeType: string;
  metadata?: Record<string, any>;
  isActive: boolean;
  unlockPrice: number; // in tokens
  unlockCount: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const videoSchema: Schema = new Schema({
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
  prompt: { 
    type: String,
    trim: true 
  },
  categorySelections: { 
    type: Schema.Types.Mixed 
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
  duration: { 
    type: Number,
    default: 0 // Duration in seconds
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
    default: 1, // Default to 1 token per video
    min: 0 
  },
  unlockCount: { 
    type: Number, 
    default: 0 
  },
  views: { 
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
videoSchema.index({ isBlurred: 1, isActive: 1 });
videoSchema.index({ category: 1, isActive: 1 });
videoSchema.index({ uploadedBy: 1 });
videoSchema.index({ createdAt: -1 });

export const VideoModel = mongoose.model<IVideo>('Video', videoSchema);