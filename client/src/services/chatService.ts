import { api } from '../utils/api';

export interface Message {
  _id: string;
  userId: string;
  characterId: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  conversationId: string;
}

export interface Character {
  id: string;
  name: string;
  image: string;
  personality?: string;
  description?: string;
}

export interface Conversation {
  conversationId: string;
  character: Character;
  lastMessage: Message;
  messageCount: number;
}

export interface ChatResponse {
  userMessage: Message;
  assistantMessage: Message;
  character: Character;
}

export interface StartConversationResponse {
  conversationId: string;
  greeting: Message;
  character: Character;
}

class ChatService {
  async startConversation(characterId: string): Promise<StartConversationResponse> {
    return api.post('/chat/start', { characterId });
  }

  async sendMessage(
    characterId: string,
    message: string,
    conversationId: string
  ): Promise<ChatResponse> {
    return api.post('/chat/send', {
      characterId,
      message,
      conversationId,
    });
  }

  async getConversationHistory(
    characterId: string,
    conversationId: string
  ): Promise<{ messages: Message[] }> {
    return api.get(`/chat/history/${characterId}/${conversationId}`);
  }

  async getSuggestions(characterId: string): Promise<{ suggestions: string[] }> {
    return api.get(`/chat/suggestions/${characterId}`);
  }

  async getRecentConversations(): Promise<{ conversations: Conversation[] }> {
    return api.get('/chat/recent');
  }
}

export const chatService = new ChatService(); 