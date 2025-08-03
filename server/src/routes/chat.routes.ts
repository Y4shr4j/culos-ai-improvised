import express from 'express';
import { protect } from '../middleware/auth';
import { storage } from '../services/chatStorage';
import { generateChatResponse } from '../services/aiService';
import { insertChatSessionSchema, insertMessageSchema, type ChatResponse } from "../services/chatStorage";

const router = express.Router();

// Get all characters
router.get('/characters', async (req, res) => {
  try {
    const characters = await storage.getAllCharacters();
    res.json(characters);
  } catch (error) {
    console.error("Error fetching characters:", error);
    res.status(500).json({ message: "Failed to fetch characters" });
  }
});

// Get character by ID
router.get('/characters/:id', async (req, res) => {
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

// Find or create chat session for character
router.post('/sessions', async (req, res) => {
  try {
    const validatedData = insertChatSessionSchema.parse(req.body);
    
    // Verify character exists
    const character = await storage.getCharacter(validatedData.characterId);
    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }

    const session = await storage.findOrCreateChatSession(validatedData.characterId);
    res.json(session);
  } catch (error) {
    console.error("Error finding/creating session:", error);
    res.status(500).json({ message: "Failed to find/create session" });
  }
});

// Get session messages
router.get('/sessions/:id/messages', async (req, res) => {
  try {
    const messages = await storage.getMessagesBySession(req.params.id);
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// Send message and get AI response
router.post('/sessions/:id/messages', async (req, res) => {
  try {
    const sessionId = req.params.id;
    const validatedData = insertMessageSchema.parse({
      ...req.body,
      sessionId,
      role: "user"
    });

    // Get session and character
    const session = await storage.getChatSession(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const character = await storage.getCharacter(session.characterId);
    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }

    // Save user message
    const userMessage = await storage.createMessage(validatedData);

    // Get conversation history
    const conversationHistory = await storage.getMessagesBySession(sessionId);

    // Generate AI response
    const aiResponseContent = await generateChatResponse(
      validatedData.content,
      character,
      conversationHistory
    );

    // Save AI response
    const aiMessage = await storage.createMessage({
      sessionId,
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

// Clear session messages
router.delete('/sessions/:id/messages', async (req, res) => {
  try {
    await storage.clearSessionMessages(req.params.id);
    res.json({ message: "Messages cleared successfully" });
  } catch (error) {
    console.error("Error clearing messages:", error);
    res.status(500).json({ message: "Failed to clear messages" });
  }
});

// Legacy routes for backward compatibility
router.use(protect);

// Start a new conversation with a character
router.post('/start', async (req, res) => {
  try {
    const { characterId } = req.body;
    const session = await storage.findOrCreateChatSession(characterId);
    const character = await storage.getCharacter(characterId);
    
    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }

    res.json({
      conversationId: session.id,
      character,
      greeting: {
        _id: 'greeting',
        userId: 'system',
        characterId: character.id,
        content: `Hi! I'm ${character.name}. ${character.description}`,
        role: 'assistant',
        timestamp: new Date(),
        conversationId: session.id
      }
    });
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({ message: "Failed to start conversation" });
  }
});

// Send a message and get AI response
router.post('/send', async (req, res) => {
  try {
    const { characterId, message, conversationId } = req.body;
    
    const session = await storage.getChatSession(conversationId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const character = await storage.getCharacter(characterId);
    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }

    // Save user message
    const userMessage = await storage.createMessage({
      sessionId: conversationId,
      content: message,
      role: "user"
    });

    // Get conversation history
    const conversationHistory = await storage.getMessagesBySession(conversationId);

    // Generate AI response
    const aiResponseContent = await generateChatResponse(
      message,
      character,
      conversationHistory
    );

    // Save AI response
    const assistantMessage = await storage.createMessage({
      sessionId: conversationId,
      content: aiResponseContent,
      role: "assistant"
    });

    res.json({
      userMessage,
      assistantMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: "Failed to send message" });
  }
});

// Get conversation history
router.get('/history/:characterId/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await storage.getMessagesBySession(conversationId);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    res.status(500).json({ message: "Failed to fetch conversation history" });
  }
});

// Get conversation suggestions for a character
router.get('/suggestions/:characterId', async (req, res) => {
  try {
    const { characterId } = req.params;
    const character = await storage.getCharacter(characterId);
    
    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }

    // Generate suggestions based on character personality
    const suggestions = [
      `Hi ${character.name}! How are you today?`,
      `Tell me about yourself, ${character.name}`,
      `What do you like to do for fun?`
    ];

    res.json({ suggestions });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ message: "Failed to fetch suggestions" });
  }
});

// Get user's recent conversations
router.get('/recent', async (req, res) => {
  try {
    // This would need to be implemented to get user's recent conversations
    res.json([]);
  } catch (error) {
    console.error('Error fetching recent conversations:', error);
    res.status(500).json({ message: "Failed to fetch recent conversations" });
  }
});

export default router; 