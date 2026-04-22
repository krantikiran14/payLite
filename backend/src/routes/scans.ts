// ─── Attendance Scan Routes (Enhanced Security & Geofencing) ─────────────────
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import jwt from 'jsonwebtoken';

const SCAN_SECRET = process.env.JWT_SECRET || 'paylite-qr-secret-2026';
const GEOFENCE_RADIUS_METERS = 200; // Allow 200m radius

// Helper: Calculate distance between two points in meters
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

const scanRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // ── 1. Generate Daily QR Token ──
  fastify.get('/scans/token', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = (request as any).userId;
    const today = new Date().toISOString().split('T')[0];
    
    const user = await fastify.prisma.user.findUnique({
      where: { id: userId },
      select: { companyName: true, officeLat: true, officeLon: true }
    });

    const token = jwt.sign(
      { userId, date: today, company: user?.companyName || 'My Company' },
      SCAN_SECRET,
      { expiresIn: '24h' }
    );

    return { 
      token, 
      date: today, 
      hasOfficeLocation: !!(user?.officeLat && user?.officeLon) 
    };
  });

  // ── 2. Get Employee List ──
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

  // ── 3. Record a Scan (With Geofencing & Sequence Validation) ──
  fastify.post('/scans', async (request, reply) => {
    const { employeeId, type, token, lat, lon } = request.body as {
      employeeId: string;
      type: 'IN' | 'OUT';
      token: string;
      lat?: number;
      lon?: number;
    };

    try {
      // 1. Token Validation
      const decoded = jwt.verify(token, SCAN_SECRET) as any;
      const todayDate = new Date().toISOString().split('T')[0];
      if (decoded.date !== todayDate) {
        return reply.status(403).send({ error: 'This QR code has expired.' });
      }

      // 2. Fetch User/Company for Geofencing
      const user = await fastify.prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { officeLat: true, officeLon: true }
      });

      // 3. Geofencing Check
      if (user?.officeLat && user?.officeLon) {
        if (!lat || !lon) {
          return reply.status(400).send({ error: 'Location access is required for this office.' });
        }
        const distance = getDistance(lat, lon, user.officeLat, user.officeLon);
        if (distance > GEOFENCE_RADIUS_METERS) {
          return reply.status(403).send({ 
            error: `Out of bounds. You must be within ${GEOFENCE_RADIUS_METERS}m of the office. Current distance: ${Math.round(distance)}m` 
          });
        }
      }

      // 4. Sequence Validation (IN -> OUT -> IN)
      const lastScan = await fastify.prisma.attendanceScan.findFirst({
        where: { 
          employeeId,
          scanTime: { gte: new Date(new Date().setHours(0,0,0,0)) } // Today only
        },
        orderBy: { scanTime: 'desc' }
      });

      if (type === 'IN' && lastScan?.type === 'IN') {
        return reply.status(400).send({ error: 'You are already checked IN.' });
      }
      if (type === 'OUT' && (!lastScan || lastScan.type === 'OUT')) {
        return reply.status(400).send({ error: 'You cannot check OUT without checking IN first today.' });
      }

      // 5. Audit Logging & Save
      const scan = await fastify.prisma.attendanceScan.create({
        data: {
          employeeId,
          type,
          latitude: lat,
          longitude: lon,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent']
        },
      });

      return { success: true, scanTime: scan.scanTime };
    } catch (err) {
      return reply.status(401).send({ error: 'Verification failed. Please try again.' });
    }
  });
};

export default scanRoutes;
