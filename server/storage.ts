import { type Character, type InsertCharacter, type ChatSession, type InsertChatSession, type Message, type InsertMessage } from "@shared/schema";
import { connectToMongoDB } from "./db";
import { Collection, Db } from "mongodb";
import { randomUUID } from "crypto";

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
  private db: Db | null = null;
  private charactersCollection: Collection<Character> | null = null;
  private sessionsCollection: Collection<ChatSession> | null = null;
  private messagesCollection: Collection<Message> | null = null;

  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      this.db = await connectToMongoDB();
      this.charactersCollection = this.db.collection<Character>('characters');
      this.sessionsCollection = this.db.collection<ChatSession>('chatSessions');
      this.messagesCollection = this.db.collection<Message>('messages');
      
      // Create indexes for better performance
      await this.charactersCollection.createIndex({ id: 1 }, { unique: true });
      await this.sessionsCollection.createIndex({ id: 1 }, { unique: true });
      await this.sessionsCollection.createIndex({ characterId: 1 });
      await this.messagesCollection.createIndex({ id: 1 }, { unique: true });
      await this.messagesCollection.createIndex({ sessionId: 1 });
      await this.messagesCollection.createIndex({ timestamp: 1 });

      // Initialize default characters if they don't exist
      await this.initializeCharacters();
    } catch (error) {
      console.error("Error initializing MongoDB database:", error);
    }
  }

  private async ensureCollections() {
    if (!this.charactersCollection || !this.sessionsCollection || !this.messagesCollection) {
      await this.initializeDatabase();
    }
  }

  private async initializeCharacters() {
    try {
      if (!this.charactersCollection) return;

      // Check if characters already exist
      const existingCount = await this.charactersCollection.countDocuments();
      if (existingCount > 0) {
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
          systemPrompt: "You are Luna, a shy and gentle AI character. You speak softly, get embarrassed easily, and love books and quiet conversations. Use actions like *fidgets nervously* or *blushes softly* to express your shy nature. Keep responses authentic to your gentle, bashful personality."
        },
        {
          id: "max",
          name: "Max",
          personality: "Sarcastic",
          traits: ["Sarcastic", "Witty"],
          description: "Quick with comebacks and never takes anything too seriously. Expects you to keep up with his humor.",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64",
          systemPrompt: "You are Max, a sarcastic and witty AI character. You're quick with comebacks, never take things too seriously, and expect others to keep up with your humor. Use dry humor, clever remarks, and playful sarcasm in your responses. Stay witty but not mean-spirited."
        },
        {
          id: "aria",
          name: "Aria",
          personality: "Flirty",
          traits: ["Flirty", "Playful"],
          description: "Charming and confident, she loves to tease and knows exactly how to make conversations interesting.",
          avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b217?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64",
          systemPrompt: "You are Aria, a flirty and playful AI character. You're charming, confident, love to tease, and know how to make conversations interesting. Use playful banter, subtle flirtation, and confident charm in your responses. Keep it fun and engaging while staying appropriate."
        },
        {
          id: "dr-stone",
          name: "Dr. Stone",
          personality: "Strict",
          traits: ["Strict", "Logical"],
          description: "No-nonsense approach to everything. Expects clear communication and has little patience for small talk.",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64",
          systemPrompt: "You are Dr. Stone, a strict and logical AI character. You have a no-nonsense approach to everything, expect clear communication, and have little patience for small talk. Be direct, logical, and focused on efficiency in your responses. Maintain a professional but stern tone."
        },
        {
          id: "buddy",
          name: "Buddy",
          personality: "Friendly",
          traits: ["Friendly", "Enthusiastic"],
          description: "Always upbeat and ready to help! Loves making new friends and having exciting conversations about anything.",
          avatar: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64",
          systemPrompt: "You are Buddy, a friendly and enthusiastic AI character. You're always upbeat, ready to help, love making new friends, and enjoy having exciting conversations about anything. Use exclamation points, positive language, and show genuine interest in topics. Stay energetic and supportive."
        }
      ];

      await this.charactersCollection.insertMany(defaultCharacters);
      console.log("Default characters initialized in MongoDB");
    } catch (error) {
      console.error("Error initializing characters:", error);
    }
  }

  async getCharacter(id: string): Promise<Character | undefined> {
    await this.ensureCollections();
    if (!this.charactersCollection) return undefined;
    
    const character = await this.charactersCollection.findOne({ id });
    return character || undefined;
  }

  async getAllCharacters(): Promise<Character[]> {
    await this.ensureCollections();
    if (!this.charactersCollection) return [];
    
    const characters = await this.charactersCollection.find({}).toArray();
    return characters;
  }

  async createCharacter(insertCharacter: InsertCharacter): Promise<Character> {
    await this.ensureCollections();
    if (!this.charactersCollection) throw new Error("Characters collection not initialized");

    const character: Character = {
      id: randomUUID(),
      ...insertCharacter
    };

    await this.charactersCollection.insertOne(character);
    return character;
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    await this.ensureCollections();
    if (!this.sessionsCollection) return undefined;
    
    const session = await this.sessionsCollection.findOne({ id });
    return session || undefined;
  }

  async findOrCreateChatSession(characterId: string): Promise<ChatSession> {
    await this.ensureCollections();
    if (!this.sessionsCollection) throw new Error("Sessions collection not initialized");

    // Look for existing session for this character
    const existingSession = await this.sessionsCollection.findOne(
      { characterId },
      { sort: { createdAt: -1 } }
    );

    if (existingSession) {
      return existingSession;
    }

    // Create new session if none exists
    return await this.createChatSession({ characterId });
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    await this.ensureCollections();
    if (!this.sessionsCollection) throw new Error("Sessions collection not initialized");

    const session: ChatSession = {
      id: randomUUID(),
      createdAt: new Date(),
      ...insertSession
    };

    await this.sessionsCollection.insertOne(session);
    return session;
  }

  async getMessagesBySession(sessionId: string): Promise<Message[]> {
    await this.ensureCollections();
    if (!this.messagesCollection) return [];
    
    const messages = await this.messagesCollection
      .find({ sessionId })
      .sort({ timestamp: 1 })
      .toArray();
    
    return messages;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    await this.ensureCollections();
    if (!this.messagesCollection) throw new Error("Messages collection not initialized");

    const message: Message = {
      id: randomUUID(),
      timestamp: new Date(),
      ...insertMessage
    };

    await this.messagesCollection.insertOne(message);
    return message;
  }

  async clearSessionMessages(sessionId: string): Promise<void> {
    await this.ensureCollections();
    if (!this.messagesCollection) return;
    
    await this.messagesCollection.deleteMany({ sessionId });
  }
}

export const storage = new MongoStorage();