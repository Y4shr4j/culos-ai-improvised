import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  title: string;
  content: string;
  type: 'announcement' | 'update' | 'feature' | 'news';
  status: 'draft' | 'published' | 'archived';
  author: mongoose.Types.ObjectId;
  tags: string[];
  featuredImage?: string;
  isActive: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['announcement', 'update', 'feature', 'news'],
    default: 'news'
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  author: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  tags: [{ type: String }],
  featuredImage: { type: String },
  isActive: { type: Boolean, default: true },
  publishedAt: { type: Date }
}, {
  timestamps: true
});

// Index for efficient queries
PostSchema.index({ status: 1, isActive: 1 });
PostSchema.index({ type: 1 });
PostSchema.index({ author: 1 });

export const PostModel = mongoose.model<IPost>('Post', PostSchema); 