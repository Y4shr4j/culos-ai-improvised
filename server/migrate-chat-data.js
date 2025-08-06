import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function migrateChatData() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/culosai';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get the collections directly
    const db = mongoose.connection.db;
    const chatSessionsCollection = db.collection('chatsessions');
    const chatMessagesCollection = db.collection('chatmessages');

    // Check existing data
    const sessionsWithoutUser = await chatSessionsCollection.find({ userId: { $exists: false } }).toArray();
    const messagesWithoutUser = await chatMessagesCollection.find({ userId: { $exists: false } }).toArray();

    console.log(`Found ${sessionsWithoutUser.length} sessions without userId`);
    console.log(`Found ${messagesWithoutUser.length} messages without userId`);

    if (sessionsWithoutUser.length === 0 && messagesWithoutUser.length === 0) {
      console.log('No data to migrate. All sessions and messages already have userId.');
      return;
    }

    // Create a default user ID for existing data
    const defaultUserId = 'legacy-user-' + Date.now();
    console.log(`Using default userId: ${defaultUserId} for existing data`);

    // Update sessions
    if (sessionsWithoutUser.length > 0) {
      const sessionUpdateResult = await chatSessionsCollection.updateMany(
        { userId: { $exists: false } },
        { $set: { userId: defaultUserId } }
      );
      console.log(`Updated ${sessionUpdateResult.modifiedCount} sessions with userId`);
    }

    // Update messages
    if (messagesWithoutUser.length > 0) {
      const messageUpdateResult = await chatMessagesCollection.updateMany(
        { userId: { $exists: false } },
        { $set: { userId: defaultUserId } }
      );
      console.log(`Updated ${messageUpdateResult.modifiedCount} messages with userId`);
    }

    // Verify the migration
    const remainingSessionsWithoutUser = await chatSessionsCollection.find({ userId: { $exists: false } }).toArray();
    const remainingMessagesWithoutUser = await chatMessagesCollection.find({ userId: { $exists: false } }).toArray();

    console.log(`Migration completed. Remaining sessions without userId: ${remainingSessionsWithoutUser.length}`);
    console.log(`Migration completed. Remaining messages without userId: ${remainingMessagesWithoutUser.length}`);

    if (remainingSessionsWithoutUser.length === 0 && remainingMessagesWithoutUser.length === 0) {
      console.log('✅ Migration successful! All data now has userId.');
    } else {
      console.log('⚠️  Migration incomplete. Some data still missing userId.');
    }

    // Show some sample data to verify
    const sampleSessions = await chatSessionsCollection.find({}).limit(3).toArray();
    const sampleMessages = await chatMessagesCollection.find({}).limit(3).toArray();

    console.log('\nSample sessions after migration:');
    sampleSessions.forEach(session => {
      console.log(`- Session ID: ${session.id}, Character: ${session.characterId}, User: ${session.userId}`);
    });

    console.log('\nSample messages after migration:');
    sampleMessages.forEach(message => {
      console.log(`- Message ID: ${message.id}, Session: ${message.sessionId}, User: ${message.userId}, Role: ${message.role}`);
    });

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration
migrateChatData()
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  }); 