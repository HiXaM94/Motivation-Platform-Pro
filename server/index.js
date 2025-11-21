/**
 * Main Server Entry Point
 * 
 * Simple Node.js HTTP server that serves static files and handles API routes.
 * For serverless deployment (Vercel, Netlify), the individual API files can be used directly.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import API handlers
import chatbotHandler from './api/chatbotProxy.js';
import inspirationHandler from './api/inspirationProxy.js';

const PORT = process.env.PORT || 3000;
const HOSTNAME = process.env.HOSTNAME || 'localhost';

/**
 * MIME types for static file serving
 */
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

/**
 * Parse JSON body from request
 */
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

/**
 * Parse URL query parameters
 */
function parseQuery(url) {
  const queryString = url.split('?')[1];
  if (!queryString) return {};
  
  const params = {};
  queryString.split('&').forEach(param => {
    const [key, value] = param.split('=');
    params[decodeURIComponent(key)] = decodeURIComponent(value || '');
  });
  return params;
}

/**
 * Serve static files
 */
async function serveStaticFile(req, res, filePath) {
  try {
    const extname = path.extname(filePath);
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';
    
    const content = await fs.promises.readFile(filePath);
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    } else {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
    }
  }
}

/**
 * Main request handler
 */
async function requestHandler(req, res) {
  const url = req.url;
  const method = req.method;

  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API Routes
  if (url.startsWith('/api/chatbot')) {
    try {
      req.body = method === 'POST' ? await parseBody(req) : {};
      // Wrap response methods to match serverless interface
      const mockRes = {
        status: (code) => {
          res.statusCode = code;
          return mockRes;
        },
        json: (data) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        }
      };
      await chatbotHandler(req, mockRes);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
    return;
  }

  if (url.startsWith('/api/inspiration')) {
    try {
      req.query = parseQuery(url);
      // Wrap response methods to match serverless interface
      const mockRes = {
        status: (code) => {
          res.statusCode = code;
          return mockRes;
        },
        json: (data) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        }
      };
      await inspirationHandler(req, mockRes);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
    return;
  }

  // Static file serving
  let filePath = path.join(__dirname, '..', url === '/' ? 'index.html' : url);
  
  // Security check: prevent directory traversal
  const rootDir = path.join(__dirname, '..');
  const resolvedPath = path.resolve(filePath);
  if (!resolvedPath.startsWith(rootDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  await serveStaticFile(req, res, filePath);
}

/**
 * Start the server
 */
const server = http.createServer(requestHandler);

server.listen(PORT, HOSTNAME, () => {
  console.log(`🚀 Motivation Platform Pro Server running at http://${HOSTNAME}:${PORT}/`);
  console.log(`📝 API Endpoints:`);
  console.log(`   - POST http://${HOSTNAME}:${PORT}/api/chatbot`);
  console.log(`   - GET  http://${HOSTNAME}:${PORT}/api/inspiration`);
  console.log('');
  
  // Check for API keys
  const hasOpenAI = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here';
  const hasYouTube = process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_API_KEY !== 'your_youtube_api_key_here';
  
  if (!hasOpenAI || !hasYouTube) {
    console.log('⚠️  API Key Status:');
    console.log(`   - OpenAI: ${hasOpenAI ? '✓ Configured' : '✗ Not configured (using mock)'}`);
    console.log(`   - YouTube: ${hasYouTube ? '✓ Configured' : '✗ Not configured (using mock)'}`);
    console.log('');
    console.log('ℹ️  See docs/SECRETS_AND_KEYS.md for setup instructions');
  } else {
    console.log('✓ All API keys configured');
  }
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
