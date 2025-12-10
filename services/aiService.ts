import { GoogleGenAI } from "@google/genai";
import { MODELS } from '../constants';
import { ModelId, ChatMessage } from '../types';

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function* streamResponse(
  history: ChatMessage[],
  newMessage: string,
  modelId: ModelId,
  attachments: { mimeType: string; data: string }[] = []
) {
  const config = MODELS[modelId];

  // If model is marked as coming soon, do not attempt request
  if (config.isComingSoon) {
    yield "Provider API Key Missing. Integration coming soon.";
    return;
  }

  // Map our internal chat history to the format expected by the SDK
  const historyFormatted = history.map(msg => {
    const parts: any[] = [];
    
    // Add attachments if any exist in history
    if (msg.attachments && msg.attachments.length > 0) {
      msg.attachments.forEach(att => {
        parts.push({
          inlineData: {
            mimeType: att.mimeType,
            data: att.data
          }
        });
      });
    }

    if (msg.text) {
      parts.push({ text: msg.text });
    }

    return {
      role: msg.role === 'user' ? 'user' : 'model',
      parts: parts
    };
  });

  // Prepare the content for the *current* message
  let messageContent: string | any[] = newMessage;

  if (attachments.length > 0) {
    const parts: any[] = [];
    attachments.forEach(att => {
      parts.push({
         inlineData: {
           mimeType: att.mimeType,
           data: att.data
         }
      });
    });
    if (newMessage) {
      parts.push({ text: newMessage });
    }
    messageContent = parts;
  }

  // Build the configuration
  const generationConfig: any = {
    systemInstruction: config.systemInstruction,
    tools: [],
  };

  // 1. Handle Thinking 
  if (config.useThinking) {
    generationConfig.thinkingConfig = { thinkingBudget: 8192 }; 
  }

  // 2. Handle Tools (Search, Maps)
  if (config.tools) {
    const toolsList: any[] = [];
    if (config.tools.googleSearch) toolsList.push({ googleSearch: {} });
    if (config.tools.googleMaps) toolsList.push({ googleMaps: {} });
    if (toolsList.length > 0) generationConfig.tools = toolsList;
  }

  // Create chat session
  const chat = ai.chats.create({
    model: config.baseModel,
    config: generationConfig,
    history: historyFormatted
  });

  try {
    // Send message. 
    // If we have just text, sending it as a string is the safest and most compliant way.
    // If we have multimodal parts, we send the array.
    const resultStream = await chat.sendMessageStream({ 
      message: messageContent 
    });

    for await (const chunk of resultStream) {
      const text = chunk.text;
      if (text) {
        yield text;
      }
    }
  } catch (error) {
    console.error("Error in streamResponse:", error);
    yield "\n\n*[System Error: Unable to connect to the model or tool use failed. Please try again.]*";
  }
}