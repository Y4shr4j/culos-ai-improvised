import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testAuth() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/culosai';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get the collections directly
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Check if there are any users in the database
    const users = await usersCollection.find({}).toArray();
    console.log(`\nTotal users in database: ${users.length}`);

    if (users.length > 0) {
      console.log('\nSample users:');
      users.slice(0, 3).forEach(user => {
        console.log(`- User ID: ${user._id}, Name: ${user.name}, Email: ${user.email}`);
      });
    }

    // Check for users with tokens
    const usersWithTokens = await usersCollection.find({ tokens: { $exists: true } }).toArray();
    console.log(`\nUsers with tokens: ${usersWithTokens.length}`);

    if (usersWithTokens.length > 0) {
      console.log('\nUsers with tokens:');
      usersWithTokens.forEach(user => {
        console.log(`- User ID: ${user._id}, Name: ${user.name}, Tokens: ${user.tokens}`);
      });
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run test
testAuth()
  .then(() => {
    console.log('Auth test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Auth test failed:', error);
    process.exit(1);
  }); 