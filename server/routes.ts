import type { Express, Request, Response } from 'express';
import { generateDatasetStory, askDataAssistant, getGenAI } from './geminiService.js';

export function registerApiRoutes(app: Express) {
  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    const hasKey = !!process.env.GEMINI_API_KEY;
    res.json({
      status: 'ok',
      hasGeminiKey: hasKey,
      timestamp: new Date().toISOString(),
    });
  });

  // Analyze dataset with Gemini
  app.post('/api/analyze', async (req: Request, res: Response) => {
    try {
      const input = req.body;
      if (!input || !input.name || !input.columns) {
        return res.status(400).json({ error: 'Invalid dataset payload' });
      }

      const hasKey = !!process.env.GEMINI_API_KEY;
      if (!hasKey) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY is not configured on the server',
          needsKey: true,
        });
      }

      const result = await generateDatasetStory(input);
      return res.json(result);
    } catch (err: any) {
      console.error('Error in /api/analyze:', err);
      return res.status(500).json({
        error: err.message || 'Failed to analyze dataset with Gemini',
      });
    }
  });

  // Chat Q&A with Gemini
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const input = req.body;
      if (!input || !input.question) {
        return res.status(400).json({ error: 'Question is required' });
      }

      const hasKey = !!process.env.GEMINI_API_KEY;
      if (!hasKey) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY is not configured on the server',
          needsKey: true,
        });
      }

      const result = await askDataAssistant(input);
      return res.json(result);
    } catch (err: any) {
      console.error('Error in /api/chat:', err);
      return res.status(500).json({
        error: err.message || 'Failed to process question with Gemini',
      });
    }
  });
}
