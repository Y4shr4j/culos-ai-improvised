import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testChatIsolation() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/culosai';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get the collections directly
    const db = mongoose.connection.db;
    const chatSessionsCollection = db.collection('chatsessions');
    const chatMessagesCollection = db.collection('chatmessages');

    // Check all sessions
    const allSessions = await chatSessionsCollection.find({}).toArray();
    console.log(`\nTotal sessions in database: ${allSessions.length}`);

    if (allSessions.length > 0) {
      console.log('\nSample sessions:');
      allSessions.slice(0, 5).forEach(session => {
        console.log(`- Session ID: ${session.id}, Character: ${session.characterId}, User: ${session.userId || 'NO USER ID'}`);
      });
    }

    // Check all messages
    const allMessages = await chatMessagesCollection.find({}).toArray();
    console.log(`\nTotal messages in database: ${allMessages.length}`);

    if (allMessages.length > 0) {
      console.log('\nSample messages:');
      allMessages.slice(0, 5).forEach(message => {
        console.log(`- Message ID: ${message.id}, Session: ${message.sessionId}, User: ${message.userId || 'NO USER ID'}, Role: ${message.role}, Content: ${message.content?.substring(0, 50)}...`);
      });
    }

    // Check for sessions without userId
    const sessionsWithoutUser = await chatSessionsCollection.find({ userId: { $exists: false } }).toArray();
    console.log(`\nSessions without userId: ${sessionsWithoutUser.length}`);

    // Check for messages without userId
    const messagesWithoutUser = await chatMessagesCollection.find({ userId: { $exists: false } }).toArray();
    console.log(`Messages without userId: ${messagesWithoutUser.length}`);

    // Group sessions by userId
    const sessionsByUser = {};
    allSessions.forEach(session => {
      const userId = session.userId || 'NO_USER_ID';
      if (!sessionsByUser[userId]) {
        sessionsByUser[userId] = [];
      }
      sessionsByUser[userId].push(session);
    });

    console.log('\nSessions grouped by user:');
    Object.keys(sessionsByUser).forEach(userId => {
      console.log(`- User ${userId}: ${sessionsByUser[userId].length} sessions`);
    });

    // Group messages by userId
    const messagesByUser = {};
    allMessages.forEach(message => {
      const userId = message.userId || 'NO_USER_ID';
      if (!messagesByUser[userId]) {
        messagesByUser[userId] = [];
      }
      messagesByUser[userId].push(message);
    });

    console.log('\nMessages grouped by user:');
    Object.keys(messagesByUser).forEach(userId => {
      console.log(`- User ${userId}: ${messagesByUser[userId].length} messages`);
    });

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run test
testChatIsolation()
  .then(() => {
    console.log('Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  }); 