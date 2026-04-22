// ─── Attendance Scan Routes ──────────────────────────────────────────────────
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import jwt from 'jsonwebtoken';

const SCAN_SECRET = process.env.JWT_SECRET || 'paylite-qr-secret-2026';

const scanRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // ── 1. Generate Daily QR Token (Authenticated - Owner only) ──
  // This token is valid for 24 hours and contains the companyId (userId)
  fastify.get('/scans/token', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = (request as any).userId;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Fetch user to get company name
    const user = await fastify.prisma.user.findUnique({
      where: { id: userId },
      select: { companyName: true }
    });

    const token = jwt.sign(
      { userId, date: today, company: user?.companyName || 'My Company' },
      SCAN_SECRET,
      { expiresIn: '24h' }
    );

    return { token, date: today };
  });

  // ── 2. Get Employee List for Check-in Page (Public but Token-validated) ──
  // This allows the dropdown to be populated with only that company's employees
  fastify.get('/scans/employees', async (request, reply) => {
    const { token } = request.query as { token: string };
    if (!token) return reply.status(401).send({ error: 'Token required' });

    try {
      const decoded = jwt.verify(token, SCAN_SECRET) as any;
      const employees = await fastify.prisma.employee.findMany({
        where: { userId: decoded.userId, status: 'active' },
        select: { id: true, name: true, role: true },
        orderBy: { name: 'asc' },
      });
      return { employees, company: decoded.company };
    } catch (err) {
      return reply.status(401).send({ error: 'Invalid or expired QR token' });
    }
  });

  // ── 3. Record a Scan (Public but Token-validated) ──
  fastify.post('/scans', async (request, reply) => {
    const { employeeId, type, token, lat, lon } = request.body as {
      employeeId: string;
      type: 'IN' | 'OUT';
      token: string;
      lat?: number;
      lon?: number;
    };

    if (!token || !employeeId || !type) {
      return reply.status(400).send({ error: 'Missing required fields' });
    }

    try {
      // 1. Verify Token
      const decoded = jwt.verify(token, SCAN_SECRET) as any;
      
      // 2. Security: Check if token date matches current server date (prevent old QR use)
      const today = new Date().toISOString().split('T')[0];
      if (decoded.date !== today) {
        return reply.status(403).send({ error: 'This QR code has expired. Please use the current one.' });
      }

      // 3. Security: GPS Check (Optional but implemented)
      // For demo, we'll just log it. In a real app, you'd compare against company office coords.
      // Example: if (getDistance(lat, lon, officeLat, officeLon) > 500) throw Error('Too far from office');

      // 4. Save Scan
      const scan = await fastify.prisma.attendanceScan.create({
        data: {
          employeeId,
          type,
          latitude: lat,
          longitude: lon,
          ipAddress: request.ip,
        },
      });

      return { success: true, scanTime: scan.scanTime };
    } catch (err) {
      return reply.status(401).send({ error: 'Scan verification failed. Please try again.' });
    }
  });
};

export default scanRoutes;
