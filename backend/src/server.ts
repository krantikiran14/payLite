// ─── PayLite Server Entry Point ─────────────────────────────────────────────
import 'dotenv/config';
import { buildApp } from './app';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  try {
    const app = await buildApp();

    await app.listen({ port: PORT, host: HOST });
    app.log.info(`🚀 PayLite API running at http://localhost:${PORT}`);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
