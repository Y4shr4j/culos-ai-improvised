import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testChatAPI() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/culosai';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get the collections directly
    const db = mongoose.connection.db;
    const chatSessionsCollection = db.collection('chatsessions');
    const chatMessagesCollection = db.collection('chatmessages');
    const charactersCollection = db.collection('characters');

    // Check if there are any characters in the database
    const characters = await charactersCollection.find({}).toArray();
    console.log(`\nTotal characters in database: ${characters.length}`);

    if (characters.length === 0) {
      console.log('No characters found. The chat system needs characters to work.');
      console.log('Characters should be initialized by the chatStorage service.');
    } else {
      console.log('\nSample characters:');
      characters.slice(0, 3).forEach(character => {
        console.log(`- Character ID: ${character.id}, Name: ${character.name}`);
      });
    }

    // Check if there are any sessions in the database
    const allSessions = await chatSessionsCollection.find({}).toArray();
    console.log(`\nTotal sessions in database: ${allSessions.length}`);

    if (allSessions.length > 0) {
      console.log('\nSample sessions:');
      allSessions.slice(0, 3).forEach(session => {
        console.log(`- Session ID: ${session.id}, Character: ${session.characterId}, User: ${session.userId || 'NO USER ID'}`);
      });
    }

    // Check if there are any messages in the database
    const allMessages = await chatMessagesCollection.find({}).toArray();
    console.log(`\nTotal messages in database: ${allMessages.length}`);

    if (allMessages.length > 0) {
      console.log('\nSample messages:');
      allMessages.slice(0, 3).forEach(message => {
        console.log(`- Message ID: ${message.id}, Session: ${message.sessionId}, User: ${message.userId || 'NO USER ID'}, Role: ${message.role}`);
      });
    }

    // Test user-specific filtering
    if (allSessions.length > 0) {
      console.log('\nTesting user-specific filtering:');
      
      // Get unique user IDs
      const userIds = [...new Set(allSessions.map(s => s.userId).filter(id => id))];
      console.log(`Found ${userIds.length} unique users with sessions`);
      
      userIds.forEach(userId => {
        const userSessions = allSessions.filter(s => s.userId === userId);
        const userMessages = allMessages.filter(m => m.userId === userId);
        console.log(`- User ${userId}: ${userSessions.length} sessions, ${userMessages.length} messages`);
      });
    }

    console.log('\n✅ Chat API test completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Start the server: npm start');
    console.log('2. Log in with different user accounts');
    console.log('3. Create chat sessions and send messages');
    console.log('4. Verify that each user only sees their own conversations');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run test
testChatAPI()
  .then(() => {
    console.log('Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  }); 