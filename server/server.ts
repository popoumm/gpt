import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import * as trpcExpress from '@trpc/server/adapters/express';
import { startPriceService } from './services/priceService';
import { parseUserFromAuthHeader } from './services/auth';
import { getLatestPrices } from './services/priceService';
import { getOrderBook, getRecentTrades } from './services/trading';

startPriceService();
import { appRouter } from './router';
export type { AppRouter } from './router';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get('/api/stream/market', async (req, res) => {
    const asset = typeof req.query.asset === 'string' ? req.query.asset : undefined;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const sendSnapshot = async () => {
      try {
        const payload = {
          ts: Date.now(),
          prices: getLatestPrices(),
          orderBook: await getOrderBook(asset),
          recentTrades: await getRecentTrades(asset),
        };

        res.write(`data: ${JSON.stringify(payload)}\\n\\n`);
      } catch (error: any) {
        res.write(`event: error\\n`);
        res.write(`data: ${JSON.stringify({ message: error?.message ?? 'stream error' })}\\n\\n`);
      }
    };

    sendSnapshot();
    const timer = setInterval(sendSnapshot, 2000);

    req.on('close', () => {
      clearInterval(timer);
      res.end();
    });
  });

  app.use(
    '/api/trpc',
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext: ({ req }) => ({
        user: parseUserFromAuthHeader(req.headers.authorization),
      }),
    })
  );

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
