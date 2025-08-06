import mongoose, { Document, Schema } from 'mongoose';

export interface IChatSession extends Document {
  id: string;
  characterId: string;
  userId: string; // Add user ID for individual sessions
  createdAt: Date;
  updatedAt: Date;
}

const ChatSessionSchema = new Schema<IChatSession>({
  id: { type: String, required: true, unique: true },
  characterId: { type: String, required: true },
  userId: { type: String, required: true } // Add user ID field
}, {
  timestamps: true
});

// Index for efficient queries - include userId for user-specific queries
ChatSessionSchema.index({ characterId: 1, userId: 1 });
ChatSessionSchema.index({ userId: 1 }); // Index for user-specific queries

export const ChatSessionModel = mongoose.model<IChatSession>('ChatSession', ChatSessionSchema); 