// ─── Fastify App Factory ────────────────────────────────────────────────────
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import dbPlugin from './plugins/db';
import authPlugin from './plugins/auth';
import authRoutes from './routes/auth';
import employeeRoutes from './routes/employees';
import attendanceRoutes from './routes/attendance';
import bonusRoutes from './routes/bonuses';
import payrollRoutes from './routes/payroll';
import scanRoutes from './routes/scans';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: process.env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
    },
  });

  // ── Plugins ──
  await app.register(cors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  });
  await app.register(cookie);
  await app.register(dbPlugin);
  await app.register(authPlugin);

  // ── Routes ──
  await app.register(authRoutes);
  await app.register(employeeRoutes);
  await app.register(attendanceRoutes);
  await app.register(bonusRoutes);
  await app.register(payrollRoutes);
  await app.register(scanRoutes);

  // ── Health check ──
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  return app;
}
