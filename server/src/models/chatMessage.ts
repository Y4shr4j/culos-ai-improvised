import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage extends Document {
  id: string;
  sessionId: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  id: { type: String, required: true, unique: true },
  sessionId: { type: String, required: true },
  content: { type: String, required: true },
  role: { type: String, enum: ["user", "assistant"], required: true },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Index for efficient queries
ChatMessageSchema.index({ sessionId: 1 });
ChatMessageSchema.index({ timestamp: 1 });

export const ChatMessageModel = mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema); 