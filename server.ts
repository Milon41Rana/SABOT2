import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// Lazy get or initialize GoogleGenAI client
function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Title generation endpoint for conversation history
app.post('/api/generate-title', async (req, res) => {
  try {
    const { firstMessage } = req.body;
    if (!firstMessage) {
      return res.json({ title: 'New Conversation' });
    }

    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: `Generate a concise, elegant 3 to 5 word topic title summarizing this initial user query: "${firstMessage.slice(0, 300)}". Do not include quotes, punctuation, or formatting. Output only the title text.`,
      config: {
        temperature: 0.3,
      },
    });

    const title = response.text?.trim() || 'New Chat';
    return res.json({ title: title.replace(/^["']|["']$/g, '').slice(0, 40) });
  } catch (error: any) {
    console.error('Error generating title:', error);
    return res.json({ title: 'New Conversation' });
  }
});

// Main Chat Streaming API
app.post('/api/chat', async (req, res) => {
  try {
    const {
      messages = [],
      systemInstruction,
      useSearch = false,
      model = 'gemini-3.7-flash',
      temperature = 0.7,
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const ai = getAIClient();

    // Map conversation history to Gemini contents format
    const contents = messages.map((msg: any) => {
      const parts: any[] = [];

      // Multimodal images
      if (Array.isArray(msg.images) && msg.images.length > 0) {
        for (const img of msg.images) {
          if (img && img.data) {
            const cleanBase64 = img.data.replace(/^data:[^;]+;base64,/, '');
            parts.push({
              inlineData: {
                mimeType: img.mimeType || 'image/jpeg',
                data: cleanBase64,
              },
            });
          }
        }
      }

      if (msg.text && typeof msg.text === 'string') {
        parts.push({ text: msg.text });
      }

      return {
        role: msg.role === 'user' ? 'user' : 'model',
        parts: parts.length > 0 ? parts : [{ text: ' ' }],
      };
    });

    const config: any = {};
    if (systemInstruction && typeof systemInstruction === 'string' && systemInstruction.trim()) {
      config.systemInstruction = systemInstruction.trim();
    }
    if (typeof temperature === 'number') {
      config.temperature = Math.max(0, Math.min(2, temperature));
    }
    if (useSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    // Set headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Lock model to gemini-3.1-flash-lite
    const streamResult = await ai.models.generateContentStream({
      model: 'gemini-3.1-flash-lite',
      contents,
      config,
    });

    for await (const chunk of streamResult) {
      const text = chunk.text || '';
      const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks || null;
      const webSearchQueries = chunk.candidates?.[0]?.groundingMetadata?.webSearchQueries || null;

      const payload = JSON.stringify({
        text,
        groundingChunks,
        webSearchQueries,
      });

      res.write(`data: ${payload}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    // If headers already sent, write SSE error
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: error.message || 'An error occurred during generation.' })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      res.status(500).json({ error: error.message || 'Failed to process chat request' });
    }
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Chatbot server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
