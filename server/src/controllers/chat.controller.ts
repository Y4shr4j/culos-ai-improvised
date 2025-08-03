import { Request, Response } from 'express';
import { MessageModel, IMessage } from '../models/message';
import { CharacterModel, ICharacter } from '../models/character';
import { geminiService } from '../services/geminiService';

// Get conversation history
export const getConversationHistory = async (req: Request, res: Response) => {
  try {
    const { characterId, conversationId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const messages = await MessageModel.find({
      userId,
      characterId,
      conversationId
    }).sort({ timestamp: 1 });

    res.json({ messages });
  } catch (error) {
    console.error('Get conversation history error:', error);
    res.status(500).json({ message: 'Error fetching conversation history' });
  }
};

// Send a message and get AI response
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { characterId, message, conversationId } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!characterId || !message) {
      return res.status(400).json({ message: 'Character ID and message are required' });
    }

    // Get the character
    const character = await CharacterModel.findById(characterId);
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    // Get conversation history for context
    const conversationHistory = await MessageModel.find({
      userId,
      characterId,
      conversationId: conversationId || 'default'
    }).sort({ timestamp: 1 });

    // Save user message
    const userMessage = await MessageModel.create({
      userId,
      characterId,
      content: message,
      role: 'user',
      conversationId: conversationId || 'default'
    });

    // Generate AI response
    let aiResponse: string;
    try {
      aiResponse = await geminiService.generateCharacterResponse(
        character,
        message,
        conversationHistory
      );
    } catch (error) {
      console.error('AI response generation failed:', error);
      aiResponse = "I'm sorry, I'm having trouble responding right now. Could you try again?";
    }

    // Save AI response
    const assistantMessage = await MessageModel.create({
      userId,
      characterId,
      content: aiResponse,
      role: 'assistant',
      conversationId: conversationId || 'default'
    });

    res.json({
      userMessage,
      assistantMessage,
      character: {
        id: character._id,
        name: character.name,
        image: character.image
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
};

// Get conversation suggestions
export const getSuggestions = async (req: Request, res: Response) => {
  try {
    const { characterId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const character = await CharacterModel.findById(characterId);
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    const suggestions = await geminiService.generateSuggestions(character);
    res.json({ suggestions });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ message: 'Error generating suggestions' });
  }
};

// Get user's recent conversations
export const getRecentConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get unique conversation IDs with their latest message
    const conversations = await MessageModel.aggregate([
      { $match: { userId } },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: { characterId: '$characterId', conversationId: '$conversationId' },
          lastMessage: { $first: '$$ROOT' },
          messageCount: { $sum: 1 }
        }
      },
      { $sort: { 'lastMessage.timestamp': -1 } },
      { $limit: 10 }
    ]);

    // Populate character information
    const conversationsWithCharacters = await Promise.all(
      conversations.map(async (conv) => {
        const character = await CharacterModel.findById(conv._id.characterId);
        return {
          conversationId: conv._id.conversationId,
          character: character ? {
            id: character._id,
            name: character.name,
            image: character.image
          } : null,
          lastMessage: conv.lastMessage,
          messageCount: conv.messageCount
        };
      })
    );

    res.json({ conversations: conversationsWithCharacters });
  } catch (error) {
    console.error('Get recent conversations error:', error);
    res.status(500).json({ message: 'Error fetching recent conversations' });
  }
};

// Start a new conversation
export const startConversation = async (req: Request, res: Response) => {
  try {
    const { characterId } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const character = await CharacterModel.findById(characterId);
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    const conversationId = `${userId}_${characterId}_${Date.now()}`;

    // Generate initial greeting
    let greeting: string;
    try {
      greeting = await geminiService.generateCharacterResponse(
        character,
        "Hello",
        []
      );
    } catch (error) {
      console.error('Greeting generation failed:', error);
      greeting = `Hi there! I'm ${character.name}. Nice to meet you!`;
    }

    // Save the greeting
    const greetingMessage = await MessageModel.create({
      userId,
      characterId,
      content: greeting,
      role: 'assistant',
      conversationId
    });

    res.json({
      conversationId,
      greeting: greetingMessage,
      character: {
        id: character._id,
        name: character.name,
        image: character.image,
        personality: character.personality,
        description: character.description
      }
    });
  } catch (error) {
    console.error('Start conversation error:', error);
    res.status(500).json({ message: 'Error starting conversation' });
  }
}; 