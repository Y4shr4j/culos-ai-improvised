import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ChatSessionModel } from './src/models/chatSession.js';
import { ChatMessageModel } from './src/models/chatMessage.js';

dotenv.config();

async function migrateChatToUserSpecific() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/culosai';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get all existing sessions without userId
    const sessionsWithoutUser = await ChatSessionModel.find({ userId: { $exists: false } });
    console.log(`Found ${sessionsWithoutUser.length} sessions without userId`);

    // Get all existing messages without userId
    const messagesWithoutUser = await ChatMessageModel.find({ userId: { $exists: false } });
    console.log(`Found ${messagesWithoutUser.length} messages without userId`);

    if (sessionsWithoutUser.length === 0 && messagesWithoutUser.length === 0) {
      console.log('No data to migrate. All sessions and messages already have userId.');
      return;
    }

    // Create a default user ID for existing data
    // In a real scenario, you might want to prompt the user or handle this differently
    const defaultUserId = 'legacy-user-' + Date.now();
    console.log(`Using default userId: ${defaultUserId} for existing data`);

    // Update sessions
    if (sessionsWithoutUser.length > 0) {
      const sessionUpdateResult = await ChatSessionModel.updateMany(
        { userId: { $exists: false } },
        { $set: { userId: defaultUserId } }
      );
      console.log(`Updated ${sessionUpdateResult.modifiedCount} sessions with userId`);
    }

    // Update messages
    if (messagesWithoutUser.length > 0) {
      const messageUpdateResult = await ChatMessageModel.updateMany(
        { userId: { $exists: false } },
        { $set: { userId: defaultUserId } }
      );
      console.log(`Updated ${messageUpdateResult.modifiedCount} messages with userId`);
    }

    // Verify the migration
    const remainingSessionsWithoutUser = await ChatSessionModel.find({ userId: { $exists: false } });
    const remainingMessagesWithoutUser = await ChatMessageModel.find({ userId: { $exists: false } });

    console.log(`Migration completed. Remaining sessions without userId: ${remainingSessionsWithoutUser.length}`);
    console.log(`Migration completed. Remaining messages without userId: ${remainingMessagesWithoutUser.length}`);

    if (remainingSessionsWithoutUser.length === 0 && remainingMessagesWithoutUser.length === 0) {
      console.log('✅ Migration successful! All data now has userId.');
    } else {
      console.log('⚠️  Migration incomplete. Some data still missing userId.');
    }

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateChatToUserSpecific()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

export { migrateChatToUserSpecific }; 