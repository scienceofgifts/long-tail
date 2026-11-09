import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  handleExpandEntities,
  handleMineAutocomplete,
  handleScoreAndBrief,
} from './src/server/radarApiHandlers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));

  app.post('/api/expand-entities', async (req, res) => {
    try {
      const result = await handleExpandEntities(req.body || {}, process.env.GEMINI_API_KEY);
      res.json(result);
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Failed to expand entities',
      });
    }
  });

  app.post('/api/mine-autocomplete', async (req, res) => {
    try {
      const result = await handleMineAutocomplete(req.body || {});
      res.json(result);
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Failed to mine autocomplete',
      });
    }
  });

  app.post('/api/score-and-brief', async (req, res) => {
    try {
      const result = await handleScoreAndBrief(req.body || {}, process.env.GEMINI_API_KEY);
      res.json(result);
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Failed to score and brief',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Long-Tail Gift Radar running at http://localhost:${PORT}`);
  });
}

startServer();
