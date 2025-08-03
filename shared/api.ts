/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// Chat Schema Types
import { z } from "zod";

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
