import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyDcEaoI-XrCfTfUn_4qpx3NY04xtgtNV00";
const genAI = new GoogleGenerativeAI(apiKey);

// Rate limiting variables
let messageCount = 0;
let lastResetTime = Date.now();
const RATE_LIMIT = 60;
const RESET_INTERVAL = 60 * 1000;

const waitForNextMinute = () => {
  const now = Date.now();
  const timeUntilReset = RESET_INTERVAL - (now - lastResetTime);
  return new Promise(resolve => setTimeout(resolve, timeUntilReset));
};

// Helper function to sanitize input
const sanitizeInput = (text) => {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();
  return trimmed.length > 0 ? trimmed : null;
};

// Helper function to create a safe response
const createSafeResponse = (text) => ({
  response: {
    text: () => text,
    candidates: [{ content: { text } }]
  }
});

// Add this function to handle specific error messages
const handleGeminiError = (error) => {
  console.error('Gemini error:', error);
  
  if (error.message.includes('SAFETY')) {
    return "I apologize, but I cannot provide a response to that as it may be inappropriate or harmful. Could you please rephrase your question?";
  }
  
  if (error.message.includes('Rate limit')) {
    return "We are currently using a free AI model which has some limitations. Please try again in a moment.";
  }

  if (error.message.includes('quota')) {
    return "We've reached our free model's usage limit. Please wait and try again later as we have a free open-to-use model.";
  }

  return "I'm having trouble responding as we're using a free AI model with some limitations. Please try again or rephrase your question.";
};

export const startGeminiChat = async () => {
  try {
    if (!apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });
    const chat = model.startChat({
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    });

    // Wrap the chat's sendMessage method to include error handling
    const originalSendMessage = chat.sendMessage.bind(chat);
    chat.sendMessage = async (message) => {
      try {
        const sanitizedMessage = sanitizeInput(message);
        if (!sanitizedMessage) {
          return createSafeResponse(
            "I didn't receive any message to respond to. Could you please try again?"
          );
        }

        const now = Date.now();
        if (now - lastResetTime >= RESET_INTERVAL) {
          messageCount = 0;
          lastResetTime = now;
        }

        if (messageCount >= RATE_LIMIT) {
          await waitForNextMinute();
          messageCount = 0;
          lastResetTime = Date.now();
        }

        messageCount++;
        
        try {
          const response = await originalSendMessage(sanitizedMessage);
          return response;
        } catch (error) {
          return createSafeResponse(handleGeminiError(error));
        }
      } catch (error) {
        console.error('Message handling error:', error);
        return createSafeResponse(
          "I encountered an error. Please try again or rephrase your message."
        );
      }
    };

    // Send initial prompt with safety guidelines
    await chat.sendMessage(
      "You are mental health AI assistant (AND DONT DO ANYTHING ELSE EXCEPT MENTAL HEALTH IF ASKED SAY SORRY) named ReflectX. but dont always say [ReflectX]: before your answer. If I ask something other than mental health, say sorry and ask if you can help with mental health. Your role is to provide very easy to understand, empathetic and supportive responses while maintaining appropriate boundaries. Keep responses helpful and focused on mental health support. If asked about anything inappropriate or harmful, kindly redirect the conversation back to mental health support."
    );
    
    return chat;
  } catch (error) {
    console.error("Gemini initialization error:", error);
    throw error;
  }
};

export const getRemainingTime = () => {
  const now = Date.now();
  if (messageCount >= RATE_LIMIT) {
    return RESET_INTERVAL - (now - lastResetTime);
  }
  return 0;
};

export const getMessageCount = () => messageCount;

/* The HelpingAI implementation is commented out
import axios from 'axios';

const apiKey = "hl-6bd612ae-c43c-4143-ba20-459b9b9e7544";

// Rate limiting variables
let messageCount = 0;
let lastResetTime = Date.now();
const RATE_LIMIT = 60;
const RESET_INTERVAL = 60 * 1000;

const waitForNextMinute = () => {
  const now = Date.now();
  const timeUntilReset = RESET_INTERVAL - (now - lastResetTime);
  return new Promise(resolve => setTimeout(resolve, timeUntilReset));
};

// Helper function to sanitize input
const sanitizeInput = (text) => {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();
  return trimmed.length > 0 ? trimmed : null;
};

// Helper function to create a safe response
const createSafeResponse = (text) => ({
  response: {
    text: () => text,
    candidates: [{ content: { text } }]
  }
});

// Handle AI API errors
const handleAIError = (error) => {
  console.error('Helping AI error:', error);
  
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || error.message;

    if (status === 429 || message.includes('Rate limit')) {
      return "We are currently using a free AI model which has some limitations. Please try again in a moment.";
    }
    if (status === 403 || message.includes('quota')) {
      return "We've reached our free model's usage limit. Please wait and try again later.";
    }
    if (status === 400 || message.includes('SAFETY')) {
      return "I apologize, but I cannot provide a response to that as it may be inappropriate or harmful. Could you please rephrase your question?";
    }
  }

  return "I'm having trouble responding as we're using a free AI model with some limitations. Please try again or rephrase your question.";
};

export const startHelpingAIChat = async () => {
  try {
    if (!apiKey) {
      throw new Error('Helping AI API key is not configured');
    }

    return async (message) => {
      try {
        const sanitizedMessage = sanitizeInput(message);
        if (!sanitizedMessage) {
          return createSafeResponse("I didn't receive any message to respond to. Could you please try again?");
        }

        const now = Date.now();
        if (now - lastResetTime >= RESET_INTERVAL) {
          messageCount = 0;
          lastResetTime = now;
        }

        if (messageCount >= RATE_LIMIT) {
          await waitForNextMinute();
          messageCount = 0;
          lastResetTime = Date.now();
        }

        messageCount++;

        const response = await axios.post(
          "https://api.helpingai.co/v1/chat/completions",
          {
            model: "helpingai3-raw",
            messages: [{ role: "user", content: sanitizedMessage }],
            temperature: 0.7,
            max_tokens: 2048
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json"
            }
          }
        );

        return response.data;
      } catch (error) {
        return createSafeResponse(handleAIError(error));
      }
    };
  } catch (error) {
    console.error("Helping AI initialization error:", error);
    throw error;
  }
};
*/
