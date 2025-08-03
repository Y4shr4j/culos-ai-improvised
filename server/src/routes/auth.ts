import express from "express";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { UserModel, IUser } from "../models/user";
import { generateToken } from "../utils/jwt";
import { protect } from "../middleware/auth";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  const { name, username, email, password } = req.body;
  const userExists = await UserModel.findOne({ email });
  if (userExists) return res.status(400).json({ message: "User already exists" });

  const usernameExists = await UserModel.findOne({ username });
  if (usernameExists) return res.status(400).json({ message: "Username already taken" });

  const hashed = await bcrypt.hash(password, 10);
  const newUser = new UserModel({ name, username, email, password: hashed, tokens: 0 });
  await newUser.save();

  res.status(201).json({ token: generateToken(String(newUser._id)), user: newUser });
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user || !user.password) return res.status(400).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  res.json({ token: generateToken(String(user._id)), user });
});

// Get user profile
router.get("/me", protect, (req, res) => {
  res.json((req as any).user);
});

// Get tokens
router.get("/tokens", protect, (req, res) => {
  res.json({ tokens: (req as any).user.tokens });
});

// Add tokens (simulate purchase)
router.post("/tokens/add", protect, async (req, res) => {
  const { amount } = req.body;
  const user = (req as any).user;
  user.tokens += amount;
  await user.save();
  res.json({ tokens: user.tokens });
});

// Use tokens (simulate generation)
router.post("/tokens/use", protect, async (req, res) => {
  const { amount } = req.body;
  const user = (req as any).user;
  if (user.tokens < amount) {
    return res.status(400).json({ message: "Not enough tokens" });
  }
  user.tokens -= amount;
  await user.save();
  res.json({ tokens: user.tokens });
});

export default router;
