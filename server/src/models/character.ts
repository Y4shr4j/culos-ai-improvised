import mongoose, { Document, Schema } from 'mongoose';

export interface ICharacter extends Document {
  name: string;
  description: string;
  personality: string;
  image: string;
  category: string;
  tags: string[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CharacterSchema = new Schema<ICharacter>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  personality: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  isActive: { type: Boolean, default: true },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, {
  timestamps: true
});

// Index for efficient queries
CharacterSchema.index({ isActive: 1 });
CharacterSchema.index({ category: 1 });
CharacterSchema.index({ createdBy: 1 });

export const CharacterModel = mongoose.model<ICharacter>('Character', CharacterSchema); 