import { GoogleGenAI } from "@google/genai";
import type { Character, Message } from "@shared/schema";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_ENV_VAR || "" 
});

export async function generateChatResponse(
  userMessage: string,
  character: Character,
  conversationHistory: Message[]
): Promise<string> {
  try {
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

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8, // Add some creativity while maintaining consistency
        maxOutputTokens: 300, // Reasonable response length
      },
      contents: prompt,
    });

    const aiResponse = response.text;

    if (!aiResponse || aiResponse.trim().length === 0) {
      throw new Error("Empty response from Gemini API");
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
