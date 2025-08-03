import mongoose, { Document, Schema } from 'mongoose';

export interface IChatSession extends Document {
  id: string;
  characterId: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSessionSchema = new Schema<IChatSession>({
  id: { type: String, required: true, unique: true },
  characterId: { type: String, required: true }
}, {
  timestamps: true
});

// Index for efficient queries
ChatSessionSchema.index({ characterId: 1 });

export const ChatSessionModel = mongoose.model<IChatSession>('ChatSession', ChatSessionSchema); 