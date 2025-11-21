/**
 * Chatbot Proxy Endpoint
 * 
 * POST /api/chatbot
 * 
 * Proxies requests to OpenAI API for chatbot functionality.
 * Reads OPENAI_API_KEY from process.env (configured via GitHub Secrets or .env file).
 * 
 * If the API key is not available, returns a mocked response for testing.
 * 
 * GitHub Secrets Configuration:
 * Add OPENAI_API_KEY to repository secrets at:
 * Settings → Secrets and variables → Actions → New repository secret
 * 
 * See docs/SECRETS_AND_KEYS.md for detailed setup instructions.
 */

/**
 * Mock responses for testing without API key
 */
const mockResponses = [
  "That's a great goal! Remember, consistency is key. Start small and build momentum each day.",
  "I believe in your ability to achieve this. What's one small step you can take today?",
  "Progress isn't always linear, but every effort counts. Keep pushing forward!",
  "It's okay to have setbacks. What matters is that you get back up and keep going.",
  "You're capable of more than you know. Trust the process and stay committed.",
  "Breaking your goal into smaller milestones can make it feel more achievable. Have you tried that?",
  "Remember why you started. Your 'why' is your fuel when motivation runs low.",
  "Celebrate small wins along the way. They're proof that you're making progress!"
];

/**
 * Get a random mock response
 */
function getMockResponse(userMessage) {
  const randomIndex = Math.floor(Math.random() * mockResponses.length);
  return mockResponses[randomIndex];
}

/**
 * Call OpenAI API
 */
async function callOpenAI(messages, apiKey) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 150,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Main handler function
 * Serverless-compatible (Vercel, Netlify, etc.)
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

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Bad request',
        message: 'Message is required and must be a non-empty string'
      });
    }

    // Check for API key
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      // Return mocked response
      console.warn('OPENAI_API_KEY not configured - using mock response');
      const mockReply = getMockResponse(message);
      
      return res.status(200).json({
        success: true,
        response: mockReply,
        mock: true,
        notice: 'Using mock response. Configure OPENAI_API_KEY in GitHub repository secrets for AI-powered responses.'
      });
    }

    // Build conversation context
    const messages = [
      {
        role: 'system',
        content: 'You are a supportive and empathetic motivation coach. Help users achieve their goals with encouragement, practical advice, and positive reinforcement. Keep responses concise and actionable.'
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message
      }
    ];

    // Call OpenAI API
    const aiResponse = await callOpenAI(messages, apiKey);

    return res.status(200).json({
      success: true,
      response: aiResponse,
      mock: false
    });

  } catch (error) {
    console.error('Chatbot proxy error:', error);
    
    // Fallback to mock on error
    const mockReply = getMockResponse(req.body?.message || '');
    
    return res.status(200).json({
      success: true,
      response: mockReply,
      mock: true,
      notice: 'An error occurred. Using mock response as fallback.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * For Express.js or standard Node.js HTTP server
 */
export function handleChatbotRequest(req, res) {
  // Parse body if needed (assumes body-parser middleware or manual parsing)
  return handler(req, res);
}
