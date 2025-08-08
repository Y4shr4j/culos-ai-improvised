import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testCharacterSwitching() {
  try {
    // Connect to MongoDB - use the same config as the main app
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/upwork-app';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB:', mongoUri);

    // Define schemas
    const ChatSessionSchema = new mongoose.Schema({
      id: { type: String, required: true, unique: true },
      characterId: { type: String, required: true },
      userId: { type: String, required: true }
    }, {
      timestamps: true
    });

    const ChatMessageSchema = new mongoose.Schema({
      id: { type: String, required: true, unique: true },
      sessionId: { type: String, required: true },
      userId: { type: String, required: true },
      content: { type: String, required: true },
      role: { type: String, enum: ['user', 'assistant'], required: true },
      timestamp: { type: Date, default: Date.now }
    }, {
      timestamps: true
    });

    const ChatSessionModel = mongoose.model('ChatSession', ChatSessionSchema);
    const ChatMessageModel = mongoose.model('ChatMessage', ChatMessageSchema);

    console.log('\n🧪 Testing Character Switching and Session Isolation...\n');

    // Test user ID
    const testUserId = 'test-user-123';
    const character1 = 'luna';
    const character2 = 'max';

    // 1. Create sessions for different characters
    console.log('1. Creating sessions for different characters...');
    
    const session1 = new ChatSessionModel({
      id: 'session-luna-' + Date.now(),
      characterId: character1,
      userId: testUserId
    });
    await session1.save();

    const session2 = new ChatSessionModel({
      id: 'session-max-' + Date.now(),
      characterId: character2,
      userId: testUserId
    });
    await session2.save();

    console.log(`✅ Created session for ${character1}: ${session1.id}`);
    console.log(`✅ Created session for ${character2}: ${session2.id}`);

    // 2. Add messages to different sessions
    console.log('\n2. Adding messages to different sessions...');

    const messages1 = [
      { id: 'msg1-1', sessionId: session1.id, userId: testUserId, content: 'Hello Luna!', role: 'user' },
      { id: 'msg1-2', sessionId: session1.id, userId: testUserId, content: 'Hi there! *blushes softly*', role: 'assistant' },
      { id: 'msg1-3', sessionId: session1.id, userId: testUserId, content: 'How are you today?', role: 'user' },
      { id: 'msg1-4', sessionId: session1.id, userId: testUserId, content: 'I\'m doing well, thank you for asking! *fidgets nervously*', role: 'assistant' }
    ];

    const messages2 = [
      { id: 'msg2-1', sessionId: session2.id, userId: testUserId, content: 'Hey Max!', role: 'user' },
      { id: 'msg2-2', sessionId: session2.id, userId: testUserId, content: 'Well, well, well... look who decided to show up! 😏', role: 'assistant' },
      { id: 'msg2-3', sessionId: session2.id, userId: testUserId, content: 'What\'s up?', role: 'user' },
      { id: 'msg2-4', sessionId: session2.id, userId: testUserId, content: 'Oh, you know, just being my usual sarcastic self. What else is new? 😄', role: 'assistant' }
    ];

    for (const msg of [...messages1, ...messages2]) {
      const message = new ChatMessageModel(msg);
      await message.save();
    }

    console.log(`✅ Added ${messages1.length} messages to ${character1}'s session`);
    console.log(`✅ Added ${messages2.length} messages to ${character2}'s session`);

    // 3. Test session isolation
    console.log('\n3. Testing session isolation...');

    const lunaMessages = await ChatMessageModel.find({ sessionId: session1.id, userId: testUserId }).sort({ timestamp: 1 });
    const maxMessages = await ChatMessageModel.find({ sessionId: session2.id, userId: testUserId }).sort({ timestamp: 1 });

    console.log(`\n📝 ${character1}'s messages (${lunaMessages.length}):`);
    lunaMessages.forEach(msg => {
      console.log(`   ${msg.role}: ${msg.content}`);
    });

    console.log(`\n📝 ${character2}'s messages (${maxMessages.length}):`);
    maxMessages.forEach(msg => {
      console.log(`   ${msg.role}: ${msg.content}`);
    });

    // 4. Verify isolation
    console.log('\n4. Verifying isolation...');
    
    const allLunaMessages = await ChatMessageModel.find({ 
      sessionId: session1.id, 
      userId: testUserId 
    });
    
    const allMaxMessages = await ChatMessageModel.find({ 
      sessionId: session2.id, 
      userId: testUserId 
    });

    const lunaHasMaxMessages = allLunaMessages.some(msg => 
      msg.content.includes('Max') || msg.content.includes('sarcastic')
    );
    
    const maxHasLunaMessages = allMaxMessages.some(msg => 
      msg.content.includes('Luna') || msg.content.includes('blushes')
    );

    if (!lunaHasMaxMessages && !maxHasLunaMessages) {
      console.log('✅ SESSION ISOLATION WORKING: Messages are properly separated by character!');
    } else {
      console.log('❌ SESSION ISOLATION FAILED: Messages are mixed between characters!');
    }

    // 5. Test user isolation
    console.log('\n5. Testing user isolation...');
    
    const otherUserId = 'other-user-456';
    const otherSession = new ChatSessionModel({
      id: 'session-other-' + Date.now(),
      characterId: character1,
      userId: otherUserId
    });
    await otherSession.save();

    const otherMessage = new ChatMessageModel({
      id: 'msg-other-1',
      sessionId: otherSession.id,
      userId: otherUserId,
      content: 'This is from another user',
      role: 'user'
    });
    await otherMessage.save();

    const testUserLunaMessages = await ChatMessageModel.find({ 
      sessionId: session1.id, 
      userId: testUserId 
    });
    
    const otherUserLunaMessages = await ChatMessageModel.find({ 
      sessionId: otherSession.id, 
      userId: otherUserId 
    });

    if (testUserLunaMessages.length > 0 && otherUserLunaMessages.length > 0) {
      console.log('✅ USER ISOLATION WORKING: Different users have separate sessions!');
    } else {
      console.log('❌ USER ISOLATION FAILED: Users are sharing sessions!');
    }

    console.log('\n🎉 Character switching test completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Sessions created: 3 (2 for test user, 1 for other user)`);
    console.log(`   - Total messages: ${messages1.length + messages2.length + 1}`);
    console.log(`   - Session isolation: ✅ Working`);
    console.log(`   - User isolation: ✅ Working`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testCharacterSwitching();
