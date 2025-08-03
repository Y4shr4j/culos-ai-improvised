import mongoose from "mongoose";

export const connectDB = async () => {
  console.log("connectDB() called");
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/upwork-app';
    console.log("Connecting to MongoDB...", mongoUri);
    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ DB connection error:", err);
    process.exit(1);
  }
};
