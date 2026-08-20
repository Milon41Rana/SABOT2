import { Handler } from '@netlify/functions';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini client securely server-side
function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build-netlify',
      },
    },
  });
}

// Netlify Serverless Function Handler - Exclusively locked to gemini-3.1-flash-lite
export const handler: Handler = async (event) => {
  // CORS preflight handling
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const {
      messages = [],
      systemInstruction,
      temperature = 0.7,
      useSearch = false,
    } = JSON.parse(event.body || '{}');

    if (!Array.isArray(messages) || messages.length === 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'মেসেজ অ্যারে পাওয়া যায়নি বা খালি।' }),
      };
    }

    const ai = getAIClient();

    // Map conversation history with multimodal and multi-turn user/model roles
    const contents = messages.map((msg: any) => {
      const parts: any[] = [];

      // Multimodal images support if present
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

    const config: any = {
      systemInstruction:
        systemInstruction && typeof systemInstruction === 'string' && systemInstruction.trim()
          ? systemInstruction.trim()
          : 'You are an intelligent, helpful, and concise AI assistant.',
      temperature: Math.max(0, Math.min(2, typeof temperature === 'number' ? temperature : 0.7)),
    };

    if (useSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    // EXCLUSIVELY Call gemini-3.1-flash-lite
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents,
      config,
    });

    const candidate = response.candidates?.[0];
    const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];
    const webSearchQueries = candidate?.groundingMetadata?.webSearchQueries || [];

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        text: response.text || '',
        model: 'gemini-3.1-flash-lite',
        groundingChunks,
        webSearchQueries,
      }),
    };
  } catch (error: any) {
    console.error('[Netlify Function Error]', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: error.message || 'Gemini 3.1 Flash Lite API কল করার সময় ত্রুটি হয়েছে।',
      }),
    };
  }
};
