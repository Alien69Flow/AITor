import { GoogleGenAI } from "@google/genai";
import { MODELS } from '../constants';
import { ModelId, ChatMessage } from '../types';

// Initialize the client
// Using process.env.API_KEY as strictly required by instructions
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function* streamResponse(
  history: ChatMessage[],
  newMessage: string,
  modelId: ModelId
) {
  const config = MODELS[modelId];

  // Map our internal chat history to the format expected by the SDK
  // We only send previous messages, not the new one (which is sent in sendMessageStream)
  const historyFormatted = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  // Build the configuration
  const generationConfig: any = {
    systemInstruction: config.systemInstruction,
  };

  // If simulate DeepSeek R1 behavior, enable thinking
  if (config.useThinking) {
    generationConfig.thinkingConfig = { thinkingBudget: 4096 }; 
  } else {
    // Disable thinking for others to ensure speed/personality match
    generationConfig.thinkingConfig = { thinkingBudget: 0 };
  }

  // Create chat session
  const chat = ai.chats.create({
    model: config.baseModel,
    config: generationConfig,
    history: historyFormatted
  });

  try {
    const resultStream = await chat.sendMessageStream({ message: newMessage });

    for await (const chunk of resultStream) {
      // The chunk is a GenerateContentResponse
      // We extract text directly
      const text = chunk.text;
      if (text) {
        yield text;
      }
    }
  } catch (error) {
    console.error("Error in streamResponse:", error);
    yield "Error: Unable to generate response. Please try again.";
  }
}
