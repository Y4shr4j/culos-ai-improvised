import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatSessionSchema, insertMessageSchema, type ChatResponse } from "@shared/schema";
import { generateChatResponse } from "./services/gemini";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all characters
  app.get("/api/characters", async (req, res) => {
    try {
      const characters = await storage.getAllCharacters();
      res.json(characters);
    } catch (error) {
      console.error("Error fetching characters:", error);
      res.status(500).json({ message: "Failed to fetch characters" });
    }
  });

  // Get character by ID
  app.get("/api/characters/:id", async (req, res) => {
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
  app.post("/api/sessions", async (req, res) => {
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
  app.get("/api/sessions/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getMessagesBySession(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send message and get AI response
  app.post("/api/sessions/:id/messages", async (req, res) => {
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
  app.delete("/api/sessions/:id/messages", async (req, res) => {
    try {
      await storage.clearSessionMessages(req.params.id);
      res.json({ message: "Messages cleared successfully" });
    } catch (error) {
      console.error("Error clearing messages:", error);
      res.status(500).json({ message: "Failed to clear messages" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
