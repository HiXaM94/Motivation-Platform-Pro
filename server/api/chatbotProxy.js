/**
 * Chatbot Proxy API Endpoint
 * 
 * Server-side proxy for OpenAI API calls to keep API keys secure.
 * This endpoint handles POST requests to /api/chatbot and forwards them to OpenAI.
 * 
 * Environment Variables Required:
 * - OPENAI_API_KEY: Your OpenAI API key (set in GitHub repo secrets or .env)
 * 
 * Request Body:
 * {
 *   "message": "user message text",
 *   "conversationHistory": [] // optional, array of previous messages
 * }
 * 
 * Response:
 * {
 *   "response": "AI generated response",
 *   "model": "gpt-4o-mini"
 * }
 */

// Import OpenAI at module level for better performance
let OpenAI = null;
let openaiInstance = null;

async function getOpenAIInstance(apiKey) {
  if (!OpenAI) {
    OpenAI = (await import('openai')).default;
  }
  if (!openaiInstance || openaiInstance.apiKey !== apiKey) {
    openaiInstance = new OpenAI({ apiKey });
  }
  return openaiInstance;
}

// Mock responses for development without API keys
const MOCK_RESPONSES = [
  "That's a great goal! Breaking it down into smaller steps can help you achieve it more effectively.",
  "Remember, consistency is key. Even small progress each day adds up to significant achievements.",
  "I believe in your ability to reach your goals. What's one small action you can take today?",
  "Every journey begins with a single step. You're already on the right path by being here.",
  "Challenges are opportunities for growth. How can you turn this obstacle into a learning experience?"
];

/**
 * Main handler function for serverless deployment (Vercel/Netlify compatible)
 * @param {Request} req - HTTP request object
 * @param {Response} res - HTTP response object
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests'
    });
  }

  try {
    const { message, conversationHistory = [] } = req.body;

    // Validate request body
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: 'Bad request',
        message: 'Message field is required and must be a string'
      });
    }

    // Check if OpenAI API key is configured
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      console.warn('OPENAI_API_KEY not configured, using mock response');
      
      // Return mock response for development
      const mockResponse = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
      return res.status(200).json({
        response: mockResponse,
        model: 'mock',
        warning: 'Using mock response. Configure OPENAI_API_KEY for real AI responses.'
      });
    }

    // Use OpenAI API
    const openai = await getOpenAIInstance(apiKey);

    // Build messages array for OpenAI
    const messages = [
      {
        role: 'system',
        content: 'You are a supportive and motivating assistant helping users achieve their goals. Provide encouraging, actionable advice in a friendly tone. Keep responses concise (2-3 sentences) unless the user asks for more detail.'
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message
      }
    ];

    // Call OpenAI API with gpt-4o-mini as default model
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      max_tokens: 150,
      temperature: 0.7
    });

    const aiResponse = completion.choices[0].message.content;

    return res.status(200).json({
      response: aiResponse,
      model: 'gpt-4o-mini',
      usage: completion.usage
    });

  } catch (error) {
    console.error('Chatbot proxy error:', error);
    
    // Handle specific OpenAI errors
    if (error.status === 401) {
      return res.status(500).json({
        error: 'API authentication failed',
        message: 'Invalid OpenAI API key. Please check your OPENAI_API_KEY configuration.'
      });
    }
    
    if (error.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests to OpenAI API. Please try again later.'
      });
    }

    // Generic error response
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while processing your request. Please try again.'
    });
  }
}

/**
 * For Node.js/Express server usage (alternative to serverless)
 * Uncomment and use this if deploying to a traditional Node.js server
 */
/*
const express = require('express');
const router = express.Router();

router.post('/api/chatbot', async (req, res) => {
  return handler(req, res);
});

module.exports = router;
*/
