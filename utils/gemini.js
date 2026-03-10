const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY = "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"; 

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

// Helper function to create a safe response matching the old interface
const createSafeResponse = (text) => ({
  response: {
    text: () => text,
    candidates: [{ content: { text } }]
  }
});

const SYSTEM_PROMPT =
  "You are mental health AI assistant (AND DONT DO ANYTHING ELSE EXCEPT MENTAL HEALTH IF ASKED SAY SORRY) named ReflectX. but dont always say [ReflectX]: before your answer. If I ask something other than mental health, say sorry and ask if you can help with mental health. Your role is to provide very easy to understand, empathetic and supportive responses while maintaining appropriate boundaries. Keep responses helpful and focused on mental health support. If asked about anything inappropriate or harmful, kindly redirect the conversation back to mental health support.";

// Handle API errors
const handleAPIError = (error) => {
  console.error('OpenRouter error:', error);

  const msg = error.message || '';

  if (msg.includes('SAFETY') || msg.includes('content_filter')) {
    return "I apologize, but I cannot provide a response to that as it may be inappropriate or harmful. Could you please rephrase your question?";
  }

  if (msg.includes('Rate limit') || msg.includes('429')) {
    return "We are currently using a free AI model which has some limitations. Please try again in a moment.";
  }

  if (msg.includes('quota') || msg.includes('402')) {
    return "We've reached our free model's usage limit. Please wait and try again later as we have a free open-to-use model.";
  }

  return "I'm having trouble responding as we're using a free AI model with some limitations. Please try again or rephrase your question.";
};

// Build a context string from ALL of the user's moods and dreams
const buildUserContext = (moods = [], dreams = []) => {
  let context = '';

  if (moods.length > 0) {
    moods.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    const moodLines = moods.map(m => {
      const date = new Date(m.timestamp).toLocaleDateString();
      return `- ${date}: ${m.moodType}${m.note ? ` | "${m.note}"` : ''}`;
    }).join('\n');
    context += `\n\nUser's COMPLETE mood history (oldest to newest):\n${moodLines}`;
  }

  if (dreams.length > 0) {
    dreams.sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));
    const dreamLines = dreams.map(d => {
      const date = d.timestamp ? new Date(d.timestamp).toLocaleDateString() : 'Unknown date';
      return `- ${date}: "${d.title}" [Type: ${d.type}]${d.description ? ` | Description: "${d.description}"` : ''}`;
    }).join('\n');
    context += `\n\nUser's COMPLETE dream history (oldest to newest):\n${dreamLines}`;
  }

  if (context) {
    context = '\n\nYou have access to the user\'s full mood and dream history below. Keep ALL of this context in mind for every response. Tailor your advice, tone, and suggestions based on their emotional patterns and dream themes. Do not dump all the data back at them, but always be aware of it.' + context;
  }

  return context;
};

export const startGeminiChat = async (moods = [], dreams = []) => {
  try {
    if (!OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key is not configured');
    }

    const userContext = buildUserContext(moods, dreams);

    // Maintain conversation history for multi-turn chat
    const conversationHistory = [
      { role: "system", content: SYSTEM_PROMPT + userContext },
    ];

    // Build a chat object with the same interface as the old Gemini chat
    const chat = {
      sendMessage: async (message) => {
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

          // Add user message to history
          conversationHistory.push({ role: "user", content: sanitizedMessage });

          try {
            const response = await fetch(OPENROUTER_API_URL, {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "openrouter/free",
                messages: conversationHistory,
                max_tokens: 2048,
                temperature: 0.7,
                top_p: 0.95,
              }),
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data?.error?.message || `API error ${response.status}`);
            }

            const assistantContent =
              data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

            // Add assistant reply to history
            conversationHistory.push({ role: "assistant", content: assistantContent });

            return createSafeResponse(assistantContent);
          } catch (error) {
            return createSafeResponse(handleAPIError(error));
          }
        } catch (error) {
          console.error('Message handling error:', error);
          return createSafeResponse(
            "I encountered an error. Please try again or rephrase your message."
          );
        }
      },
    };

    return chat;
  } catch (error) {
    console.error("Chat initialization error:", error);
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
