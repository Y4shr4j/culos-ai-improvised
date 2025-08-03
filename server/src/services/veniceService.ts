import axios from "axios";
import type { Character, Message } from "./chatStorage";

const VENICE_API_BASE_URL = "https://api.venice.ai";

export async function generateChatResponse(
  userMessage: string,
  character: Character,
  conversationHistory: Message[]
): Promise<string> {
  try {
    console.log('Generating chat response for character:', character.name);
    console.log('User message:', userMessage);
    console.log('Venice API Key available:', !!process.env.VENICE_API_KEY);
    
    // Build conversation context from history
    const contextMessages = conversationHistory
      .slice(-10) // Keep last 10 messages for context
      .map(msg => `${msg.role === "user" ? "User" : character.name}: ${msg.content}`)
      .join("\n\n");

    // Create the prompt with character system instruction
    const systemPrompt = `${character.systemPrompt}

Character Details:
- Name: ${character.name}
- Personality: ${character.personality}
- Traits: ${character.traits.join(", ")}
- Description: ${character.description}

IMPORTANT: Stay in character at all times. Never break role or mention that you are an AI. Respond naturally as ${character.name} would, incorporating your personality traits consistently.`;

    // Build the conversation context
    let prompt = `Recent conversation:\n${contextMessages}\n\nUser: ${userMessage}\n\n${character.name}:`;
    
    if (conversationHistory.length === 0) {
      // First message - include character introduction
      prompt = `This is the start of a conversation. Respond as ${character.name} would, staying true to your personality.\n\nUser: ${userMessage}\n\n${character.name}:`;
    }

    // Call Venice API with proper format
    const response = await axios.post(
      `${VENICE_API_BASE_URL}/v1/chat/completions`,
      {
        model: "venice-1.5",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.8
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.VENICE_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log('Venice API response received');
    const aiResponse = response.data.choices?.[0]?.message?.content;
    console.log('Response text length:', aiResponse?.length || 0);

    if (!aiResponse || aiResponse.trim().length === 0) {
      throw new Error("Empty response from Venice API");
    }

    return aiResponse.trim();

  } catch (error) {
    console.error("Error generating chat response:", error);
    
    // Return character-appropriate fallback response
    const fallbackResponses: Record<string, string> = {
      "Shy": "*looks down nervously* I'm sorry, I'm having trouble finding the right words right now...",
      "Sarcastic": "Great, my brain just decided to take a coffee break. How convenient.",
      "Flirty": "Oops, you've left me speechless for a moment there... *winks*",
      "Strict": "There appears to be a technical difficulty. Please repeat your statement.",
      "Friendly": "Oh no! I'm having a little trouble processing that right now, but I'm still here for you!"
    };

    return fallbackResponses[character.personality] || "I'm having trouble responding right now. Could you try again?";
  }
}

// Image generation function using Venice API
export async function generateImage(prompt: string): Promise<string> {
  try {
    const response = await axios.post(
      `${VENICE_API_BASE_URL}/v1/images/generations`,
      {
        model: "venice-1.5",
        prompt: prompt,
        n: 1,
        size: "1024x1024"
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.VENICE_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.data?.[0]?.url || "";
  } catch (error) {
    console.error("Error generating image:", error);
    return "";
  }
} 