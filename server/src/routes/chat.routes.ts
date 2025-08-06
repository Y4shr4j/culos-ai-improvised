import express from 'express';
import { protect } from '../middleware/auth';
import { storage } from '../services/chatStorage';
import { generateChatResponse } from '../services/aiService';
import { insertChatSessionSchema, insertMessageSchema, type ChatResponse } from "../services/chatStorage";
import { IUser } from '../models/user';

// Extend Express Request to include user
interface AuthenticatedRequest extends express.Request {
  user?: IUser;
}

const router = express.Router();

// Apply authentication middleware to all chat routes
router.use(protect);

// Get all characters
router.get('/characters', async (req: AuthenticatedRequest, res) => {
  try {
    const characters = await storage.getAllCharacters();
    res.json(characters);
  } catch (error) {
    console.error("Error fetching characters:", error);
    res.status(500).json({ message: "Failed to fetch characters" });
  }
});

// Get character by ID
router.get('/characters/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const character = await storage.getCharacter(req.params.id);
    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }
    res.json(character);
  } catch (error) {
    console.error("Error fetching character:", error);
    res.status(500).json({ message: "Failed to fetch character" });
  }
});

// Get user's sessions for all characters
router.get('/sessions', async (req: AuthenticatedRequest, res) => {
  try {
    // Ensure user object exists and has _id
    if (!req.user || !req.user._id) {
      console.error("User object or _id missing:", req.user);
      return res.status(401).json({ message: "User not authenticated properly" });
    }

    const userId = req.user._id.toString(); // Convert ObjectId to string
    console.log("Fetching sessions for user:", userId);
    
    const sessions = await storage.getUserSessions(userId);
    console.log("Found sessions:", sessions.length);
    
    res.json(sessions);
  } catch (error) {
    console.error("Error fetching user sessions:", error);
    res.status(500).json({ message: "Failed to fetch user sessions" });
  }
});

// Find or create chat session for character (user-specific)
router.post('/sessions', async (req: AuthenticatedRequest, res) => {
  try {
    // Ensure user object exists and has _id
    if (!req.user || !req.user._id) {
      console.error("User object or _id missing:", req.user);
      return res.status(401).json({ message: "User not authenticated properly" });
    }

    const userId = req.user._id.toString(); // Convert ObjectId to string
    console.log("Creating session for user:", userId, "character:", req.body.characterId);
    
    const validatedData = insertChatSessionSchema.parse({
      ...req.body,
      userId
    });
    
    // Verify character exists
    const character = await storage.getCharacter(validatedData.characterId);
    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }

    const session = await storage.findOrCreateChatSession(validatedData.characterId, userId);
    console.log("Created/found session:", session.id);
    
    res.json(session);
  } catch (error) {
    console.error("Error finding/creating session:", error);
    res.status(500).json({ message: "Failed to find/create session" });
  }
});

// Get session messages (user-specific)
router.get('/sessions/:id/messages', async (req: AuthenticatedRequest, res) => {
  try {
    // Ensure user object exists and has _id
    if (!req.user || !req.user._id) {
      console.error("User object or _id missing:", req.user);
      return res.status(401).json({ message: "User not authenticated properly" });
    }

    const userId = req.user._id.toString(); // Convert ObjectId to string
    console.log("Fetching messages for session:", req.params.id, "user:", userId);
    
    const messages = await storage.getMessagesBySession(req.params.id, userId);
    console.log("Found messages:", messages.length);
    
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// Send message and get AI response (user-specific)
router.post('/sessions/:id/messages', async (req: AuthenticatedRequest, res) => {
  try {
    // Ensure user object exists and has _id
    if (!req.user || !req.user._id) {
      console.error("User object or _id missing:", req.user);
      return res.status(401).json({ message: "User not authenticated properly" });
    }

    const sessionId = req.params.id;
    const userId = req.user._id.toString(); // Convert ObjectId to string
    console.log("Processing message for session:", sessionId, "user:", userId);
    
    const validatedData = insertMessageSchema.parse({
      ...req.body,
      sessionId,
      userId,
      role: "user"
    });

    // Get session and character (user-specific)
    const session = await storage.getChatSession(sessionId, userId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const character = await storage.getCharacter(session.characterId);
    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }

    // Save user message
    const userMessage = await storage.createMessage(validatedData);

    // Get conversation history (user-specific)
    const conversationHistory = await storage.getMessagesBySession(sessionId, userId);

    // Generate AI response
    const aiResponseContent = await generateChatResponse(
      validatedData.content,
      character,
      conversationHistory
    );

    // Save AI response
    const aiMessage = await storage.createMessage({
      sessionId,
      userId,
      content: aiResponseContent,
      role: "assistant"
    });

    const response: ChatResponse = {
      message: aiMessage,
      session
    };

    res.json(response);
  } catch (error) {
    console.error("Error processing message:", error);
    res.status(500).json({ message: "Failed to process message" });
  }
});

// Clear session messages (user-specific)
router.delete('/sessions/:id/messages', async (req: AuthenticatedRequest, res) => {
  try {
    // Ensure user object exists and has _id
    if (!req.user || !req.user._id) {
      console.error("User object or _id missing:", req.user);
      return res.status(401).json({ message: "User not authenticated properly" });
    }

    const sessionId = req.params.id;
    const userId = req.user._id.toString(); // Convert ObjectId to string
    console.log("Clearing messages for session:", sessionId, "user:", userId);
    
    await storage.clearSessionMessages(sessionId, userId);
    res.json({ message: "Session messages cleared" });
  } catch (error) {
    console.error("Error clearing session messages:", error);
    res.status(500).json({ message: "Failed to clear session messages" });
  }
});

// Legacy routes for backward compatibility
router.post('/start', async (req: AuthenticatedRequest, res) => {
  try {
    // Ensure user object exists and has _id
    if (!req.user || !req.user._id) {
      console.error("User object or _id missing:", req.user);
      return res.status(401).json({ message: "User not authenticated properly" });
    }

    const userId = req.user._id.toString(); // Convert ObjectId to string
    const { characterId } = req.body;
    
    const session = await storage.findOrCreateChatSession(characterId, userId);
    const character = await storage.getCharacter(characterId);
    
    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }

    // Create greeting message
    const greetingMessage = await storage.createMessage({
      sessionId: session.id,
      userId,
      content: `Hello! I'm ${character.name}. ${character.personality}`,
      role: "assistant"
    });

    res.json({
      session,
      message: greetingMessage
    });
  } catch (error) {
    console.error("Error starting chat:", error);
    res.status(500).json({ message: "Failed to start chat" });
  }
});

router.post('/send', async (req: AuthenticatedRequest, res) => {
  try {
    // Ensure user object exists and has _id
    if (!req.user || !req.user._id) {
      console.error("User object or _id missing:", req.user);
      return res.status(401).json({ message: "User not authenticated properly" });
    }

    const userId = req.user._id.toString(); // Convert ObjectId to string
    const { sessionId, message } = req.body;
    
    const session = await storage.getChatSession(sessionId, userId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const character = await storage.getCharacter(session.characterId);
    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }

    // Save user message
    const userMessage = await storage.createMessage({
      sessionId,
      userId,
      content: message,
      role: "user"
    });

    // Get conversation history
    const conversationHistory = await storage.getMessagesBySession(sessionId, userId);

    // Generate AI response
    const aiResponseContent = await generateChatResponse(
      message,
      character,
      conversationHistory
    );

    // Save AI response
    const aiMessage = await storage.createMessage({
      sessionId,
      userId,
      content: aiResponseContent,
      role: "assistant"
    });

    res.json({
      userMessage,
      aiMessage
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
});

router.get('/history/:characterId/:conversationId', async (req: AuthenticatedRequest, res) => {
  try {
    // Ensure user object exists and has _id
    if (!req.user || !req.user._id) {
      console.error("User object or _id missing:", req.user);
      return res.status(401).json({ message: "User not authenticated properly" });
    }

    const userId = req.user._id.toString(); // Convert ObjectId to string
    const { conversationId } = req.params;
    
    const messages = await storage.getMessagesBySession(conversationId, userId);
    res.json(messages);
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ message: "Failed to fetch history" });
  }
});

router.get('/recent', async (req: AuthenticatedRequest, res) => {
  try {
    // Ensure user object exists and has _id
    if (!req.user || !req.user._id) {
      console.error("User object or _id missing:", req.user);
      return res.status(401).json({ message: "User not authenticated properly" });
    }

    const userId = req.user._id.toString(); // Convert ObjectId to string
    
    const sessions = await storage.getUserSessions(userId);
    const characters = await storage.getAllCharacters();
    
    const recentConversations = sessions.map(session => {
      const character = characters.find(c => c.id === session.characterId);
      return {
        sessionId: session.id,
        characterId: session.characterId,
        characterName: character?.name || 'Unknown',
        characterAvatar: character?.avatar || '',
        lastMessage: null // Could be enhanced to include last message
      };
    });
    
    res.json(recentConversations);
  } catch (error) {
    console.error("Error fetching recent conversations:", error);
    res.status(500).json({ message: "Failed to fetch recent conversations" });
  }
});

export default router; 