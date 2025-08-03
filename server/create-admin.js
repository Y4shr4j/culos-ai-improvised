const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://rohitra4j:PhksnPNoPXYvNNhI@cluster0.y4tnegc.mongodb.net/culosAI?retryWrites=true&w=majority');

// User Schema (simplified version)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  tokens: { type: Number, default: 0 },
  isAdmin: { type: Boolean, default: false },
  ageVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@culosai.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@culosai.com');
      console.log('Password: admin123');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      username: 'admin',
      email: 'admin@culosai.com',
      password: hashedPassword,
      tokens: 1000,
      isAdmin: true,
      ageVerified: true
    });

    await adminUser.save();
    
    console.log('Admin user created successfully!');
    console.log('Email: admin@culosai.com');
    console.log('Password: admin123');
    console.log('Admin privileges: true');
    console.log('Tokens: 1000');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
  }
}

createAdminUser(); 