import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  userId: mongoose.Types.ObjectId;
  characterId: mongoose.Types.ObjectId;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  conversationId: string;
}

const MessageSchema = new Schema<IMessage>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  characterId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Character', 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['user', 'assistant'], 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  conversationId: { 
    type: String, 
    required: true 
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
MessageSchema.index({ userId: 1, characterId: 1 });
MessageSchema.index({ conversationId: 1 });
MessageSchema.index({ timestamp: -1 });

export const MessageModel = mongoose.model<IMessage>('Message', MessageSchema); 