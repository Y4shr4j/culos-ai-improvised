import mongoose, { Document, Schema } from 'mongoose';

export interface IChatCharacter extends Document {
  id: string;
  name: string;
  personality: string;
  traits: string[];
  description: string;
  avatar: string;
  systemPrompt: string;
  category: string;
  isActive: boolean;
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ChatCharacterSchema = new Schema<IChatCharacter>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  personality: { type: String, required: true },
  traits: [{ type: String }],
  description: { type: String, required: true },
  avatar: { type: String, required: true },
  systemPrompt: { type: String, required: true },
  category: { type: String, default: 'General' },
  isActive: { type: Boolean, default: true },
  createdBy: {
    name: { type: String, required: true },
    email: { type: String, required: true }
  }
}, {
  timestamps: true
});

// Index for efficient queries
ChatCharacterSchema.index({ isActive: 1 });
ChatCharacterSchema.index({ category: 1 });
ChatCharacterSchema.index({ name: 1 });

export const ChatCharacterModel = mongoose.model<IChatCharacter>('ChatCharacter', ChatCharacterSchema); 