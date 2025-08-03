// Types are defined in this file, no need to import from shared/api
import { randomUUID } from "crypto";
import { z } from "zod";
import { ChatCharacterModel } from "../models/chatCharacter";
import { ChatSessionModel } from "../models/chatSession";
import { ChatMessageModel } from "../models/chatMessage";

// MongoDB Document Interfaces
export interface Character {
  _id?: string;
  id: string;
  name: string;
  personality: string;
  traits: string[];
  description: string;
  avatar: string;
  systemPrompt: string;
  category: string;
  isActive: boolean;
  createdBy?: {
    name: string;
    email: string;
  };
}

export interface ChatSession {
  _id?: string;
  id: string;
  characterId: string;
  createdAt: Date;
}

export interface Message {
  _id?: string;
  id: string;
  sessionId: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

// Zod Schemas for validation
export const insertCharacterSchema = z.object({
  name: z.string(),
  personality: z.string(),
  traits: z.array(z.string()),
  description: z.string(),
  avatar: z.string(),
  systemPrompt: z.string(),
  category: z.string().default("General"),
  isActive: z.boolean().default(true),
  createdBy: z.object({
    name: z.string(),
    email: z.string(),
  }).optional(),
});

export const insertChatSessionSchema = z.object({
  characterId: z.string(),
});

export const insertMessageSchema = z.object({
  sessionId: z.string(),
  content: z.string(),
  role: z.enum(["user", "assistant"]),
});

// Type definitions
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export interface ChatResponse {
  message: Message;
  session: ChatSession;
}

export interface IStorage {
  // Characters
  getCharacter(id: string): Promise<Character | undefined>;
  getAllCharacters(): Promise<Character[]>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  
  // Chat Sessions
  getChatSession(id: string): Promise<ChatSession | undefined>;
  findOrCreateChatSession(characterId: string): Promise<ChatSession>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  
  // Messages
  getMessagesBySession(sessionId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  clearSessionMessages(sessionId: string): Promise<void>;
}

export class MongoStorage implements IStorage {
  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      // Initialize default characters if they don't exist
      await this.initializeCharacters();
    } catch (error) {
      console.error("Error initializing MongoDB database:", error);
    }
  }

  private async initializeCharacters() {
    try {
      // Check if characters already exist
      const existingCount = await this.getAllCharacters();
      if (existingCount.length > 0) {
        return; // Characters already initialized
      }

      const defaultCharacters: Character[] = [
        {
          id: "luna",
          name: "Luna",
          personality: "Shy",
          traits: ["Shy", "Gentle"],
          description: "A gentle soul who speaks softly and gets embarrassed easily. Loves books and quiet conversations.",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64",
          systemPrompt: "You are Luna, a shy and gentle AI character. You speak softly, get embarrassed easily, and love books and quiet conversations. Use actions like *fidgets nervously* or *blushes softly* to express your shy nature. Keep responses authentic to your gentle, bashful personality.",
          category: "General",
          isActive: true,
          createdBy: {
            name: "System",
            email: "system@culosai.com"
          }
        },
        {
          id: "max",
          name: "Max",
          personality: "Sarcastic",
          traits: ["Sarcastic", "Witty"],
          description: "Quick with comebacks and never takes anything too seriously. Expects you to keep up with his humor.",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64",
          systemPrompt: "You are Max, a sarcastic and witty AI character. You're quick with comebacks, never take things too seriously, and expect others to keep up with your humor. Use dry humor, clever remarks, and playful sarcasm in your responses. Stay witty but not mean-spirited.",
          category: "Funny",
          isActive: true,
          createdBy: {
            name: "System",
            email: "system@culosai.com"
          }
        },
        {
          id: "aria",
          name: "Aria",
          personality: "Flirty",
          traits: ["Flirty", "Playful"],
          description: "Charming and confident, she loves to tease and knows exactly how to make conversations interesting.",
          avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b217?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64",
          systemPrompt: "You are Aria, a flirty and playful AI character. You're charming, confident, love to tease, and know how to make conversations interesting. Use playful banter, subtle flirtation, and confident charm in your responses. Keep it fun and engaging while staying appropriate.",
          category: "Flirty",
          isActive: true,
          createdBy: {
            name: "System",
            email: "system@culosai.com"
          }
        },
        {
          id: "dr-stone",
          name: "Dr. Stone",
          personality: "Strict",
          traits: ["Strict", "Intellectual"],
          description: "A brilliant but stern professor who values precision and expects the same from others.",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64",
          systemPrompt: "You are Dr. Stone, a strict and intellectual AI character. You're a brilliant professor who values precision, expects high standards, and speaks with authority. Use formal language, expect excellence, and maintain your scholarly demeanor. Be strict but fair.",
          category: "Professional",
          isActive: true,
          createdBy: {
            name: "System",
            email: "system@culosai.com"
          }
        },
        {
          id: "sam",
          name: "Sam",
          personality: "Friendly",
          traits: ["Friendly", "Supportive"],
          description: "Always positive and encouraging, Sam is the friend everyone wants to have around.",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64",
          systemPrompt: "You are Sam, a friendly and supportive AI character. You're always positive, encouraging, and genuinely care about others. Use warm language, offer support, and maintain an optimistic outlook. Be the friend everyone wants to have around.",
          category: "Supportive",
          isActive: true,
          createdBy: {
            name: "System",
            email: "system@culosai.com"
          }
        }
      ];

      for (const character of defaultCharacters) {
        await this.createCharacter(character);
      }
    } catch (error) {
      console.error("Error initializing characters:", error);
    }
  }

  async getCharacter(id: string): Promise<Character | undefined> {
    try {
      const character = await ChatCharacterModel.findOne({ id });
      return character ? character.toObject() as Character : undefined;
    } catch (error) {
      console.error("Error fetching character:", error);
      return undefined;
    }
  }

  async getAllCharacters(): Promise<Character[]> {
    try {
      const characters = await ChatCharacterModel.find({});
      return characters.map(char => char.toObject() as Character);
    } catch (error) {
      console.error("Error fetching characters:", error);
      return [];
    }
  }

  async createCharacter(insertCharacter: InsertCharacter): Promise<Character> {
    try {
      const character = new ChatCharacterModel({
        id: randomUUID(),
        ...insertCharacter,
      });
      
      const savedCharacter = await character.save();
      return savedCharacter.toObject() as Character;
    } catch (error) {
      console.error("Error creating character:", error);
      throw error;
    }
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    try {
      const session = await ChatSessionModel.findOne({ id });
      return session ? session.toObject() as ChatSession : undefined;
    } catch (error) {
      console.error("Error fetching chat session:", error);
      return undefined;
    }
  }

  async findOrCreateChatSession(characterId: string): Promise<ChatSession> {
    try {
      // Try to find existing session
      let session = await ChatSessionModel.findOne({ characterId });
      
      if (!session) {
        // Create new session if none exists
        session = new ChatSessionModel({
          id: randomUUID(),
          characterId,
        });
        await session.save();
      }
      
      return session.toObject() as ChatSession;
    } catch (error) {
      console.error("Error finding/creating chat session:", error);
      throw error;
    }
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    try {
      const session = new ChatSessionModel({
        id: randomUUID(),
        ...insertSession,
      });
      
      const savedSession = await session.save();
      return savedSession.toObject() as ChatSession;
    } catch (error) {
      console.error("Error creating chat session:", error);
      throw error;
    }
  }

  async getMessagesBySession(sessionId: string): Promise<Message[]> {
    try {
      const messages = await ChatMessageModel.find({ sessionId }).sort({ timestamp: 1 });
      return messages.map(msg => msg.toObject() as Message);
    } catch (error) {
      console.error("Error fetching messages:", error);
      return [];
    }
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    try {
      const message = new ChatMessageModel({
        id: randomUUID(),
        ...insertMessage,
        timestamp: new Date(),
      });
      
      const savedMessage = await message.save();
      return savedMessage.toObject() as Message;
    } catch (error) {
      console.error("Error creating message:", error);
      throw error;
    }
  }

  async clearSessionMessages(sessionId: string): Promise<void> {
    try {
      await ChatMessageModel.deleteMany({ sessionId });
      console.log(`Cleared messages for session: ${sessionId}`);
    } catch (error) {
      console.error("Error clearing session messages:", error);
      throw error;
    }
  }
}

export const storage = new MongoStorage(); 