/**
 * Chatbot Proxy API Endpoint
 * 
 * POST /api/chatbot
 * 
 * Server-side proxy that forwards requests to OpenAI API.
 * Reads OPENAI_API_KEY from process.env for security.
 * 
 * MAINTAINER ACTION REQUIRED:
 * Add OPENAI_API_KEY to GitHub repository secrets for production deployment.
 * For local development, add OPENAI_API_KEY to .env file (DO NOT commit .env).
 */

/**
 * Handle chatbot proxy requests
 * 
 * @param {Object} req - Request object with body containing { message, conversationHistory }
 * @param {Object} res - Response object
 */
async function handleChatbotRequest(req, res) {
    // Helper function for JSON responses
    const sendJSON = (statusCode, data) => {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    };

    // CORS headers for development
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Only accept POST requests
    if (req.method !== 'POST') {
        sendJSON(405, { error: 'Method not allowed. Use POST.' });
        return;
    }

    try {
        const { message, conversationHistory = [] } = req.body;

        if (!message || typeof message !== 'string') {
            sendJSON(400, { error: 'Message is required and must be a string.' });
            return;
        }

        // Check for OpenAI API key
        const apiKey = process.env.OPENAI_API_KEY;

        // If no API key, return mock response for development
        if (!apiKey) {
            console.warn('[Chatbot Proxy] OPENAI_API_KEY not found. Returning mock response.');
            const mockResponse = {
                success: true,
                response: `Mock response: I received your message "${message}". To enable real AI responses, please add OPENAI_API_KEY to your environment variables.`,
                model: 'mock',
                usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
                isMock: true
            };
            sendJSON(200, mockResponse);
            return;
        }

        // Build messages array for OpenAI
        const messages = [
            {
                role: 'system',
                content: 'You are a supportive and motivating assistant for a personal development platform. Help users with goal setting, motivation, and positive encouragement. Keep responses concise and actionable.'
            },
            ...conversationHistory,
            {
                role: 'user',
                content: message
            }
        ];

        // Call OpenAI API
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: process.env.OPENAI_MODEL || 'gpt-4o-mini', // Default to gpt-4o-mini
                messages: messages,
                max_tokens: 500,
                temperature: 0.7
            })
        });

        if (!openaiResponse.ok) {
            const errorData = await openaiResponse.json().catch(() => ({}));
            console.error('[Chatbot Proxy] OpenAI API error:', errorData);
            
            sendJSON(openaiResponse.status, {
                error: 'OpenAI API request failed',
                details: errorData.error?.message || 'Unknown error',
                statusCode: openaiResponse.status
            });
            return;
        }

        const data = await openaiResponse.json();
        
        // Return formatted response
        sendJSON(200, {
            success: true,
            response: data.choices[0]?.message?.content || 'No response generated',
            model: data.model,
            usage: data.usage,
            isMock: false
        });

    } catch (error) {
        console.error('[Chatbot Proxy] Error:', error);
        sendJSON(500, {
            error: 'Internal server error',
            message: error.message
        });
    }
}

// Export for serverless/Node.js environments
module.exports = handleChatbotRequest;

// For direct Node.js server usage
if (require.main === module) {
    const http = require('http');
    const server = http.createServer(async (req, res) => {
        // Parse body for POST requests
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', async () => {
                try {
                    req.body = JSON.parse(body);
                } catch (e) {
                    req.body = {};
                }
                await handleChatbotRequest(req, res);
            });
        } else {
            await handleChatbotRequest(req, res);
        }
    });

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`[Chatbot Proxy] Server running on port ${PORT}`);
        console.log(`[Chatbot Proxy] OPENAI_API_KEY ${process.env.OPENAI_API_KEY ? 'found' : 'NOT found (using mock mode)'}`);
    });
}
