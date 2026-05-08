// ─── Attendance Scan Routes (Device-Pinned, Lunch Break, Self-Profile) ──────
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const SCAN_SECRET = process.env.JWT_SECRET || 'paylite-qr-secret-2026';
const GEOFENCE_RADIUS_METERS = 200;

// ── Helpers ──

function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin + 'paylite-salt').digest('hex');
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
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

function calcLunchMinutes(scans: { type: string; scanTime: Date }[]): number {
  let total = 0;
  for (let i = 0; i < scans.length; i++) {
    if (scans[i].type === 'LUNCH_START') {
      const end = scans.find((s, j) => j > i && s.type === 'LUNCH_END');
      if (end) {
        total += (new Date(end.scanTime).getTime() - new Date(scans[i].scanTime).getTime()) / 60000;
      }
    }
  }
  return Math.round(total);
}

// Valid transitions: what types can follow the last scan
const VALID_NEXT: Record<string, string[]> = {
  '': ['IN'],           // no scan today
  'IN': ['LUNCH_START', 'OUT'],
  'LUNCH_START': ['LUNCH_END'],
  'LUNCH_END': ['LUNCH_START', 'OUT'],
  'OUT': ['IN'],
};

const scanRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {

  // ── 1. Generate Daily QR Token (Admin) ──
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

  // ── 2. Get Employee List (for first-time device registration) ──
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

  // ── 3. Register Device (first-time pairing) ──
  fastify.post('/scans/register-device', async (request, reply) => {
    const { employeeId, pin, deviceId, token } = request.body as {
      employeeId: string;
      pin: string;
      deviceId: string;
      token: string;
    };

    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return reply.status(400).send({ error: 'PIN must be exactly 4 digits' });
    }

    try {
      const decoded = jwt.verify(token, SCAN_SECRET) as any;

      // Verify employee belongs to this company
      const emp = await fastify.prisma.employee.findFirst({
        where: { id: employeeId, userId: decoded.userId, status: 'active' },
        select: { id: true, name: true, role: true }
      });
      if (!emp) return reply.status(404).send({ error: 'Employee not found' });

      // Check if employee already has a PIN set (re-registration on new device)
      const existingDevice = await fastify.prisma.employeeDevice.findFirst({
        where: { employeeId }
      });

      if (existingDevice) {
        // Employee already registered → verify PIN matches
        if (existingDevice.pinHash !== hashPin(pin)) {
          return reply.status(403).send({ error: 'Incorrect PIN. Contact your admin to reset.' });
        }
        // PIN matches → register this new device
        await fastify.prisma.employeeDevice.upsert({
          where: { deviceId },
          update: { employeeId, pinHash: hashPin(pin) },
          create: { employeeId, deviceId, pinHash: hashPin(pin) }
        });
      } else {
        // First-ever registration → create device + PIN
        await fastify.prisma.employeeDevice.create({
          data: { employeeId, deviceId, pinHash: hashPin(pin) }
        });
      }

      return { success: true, employee: emp };
    } catch (err) {
      return reply.status(401).send({ error: 'Invalid or expired QR token' });
    }
  });

  // ── 4. Verify Device (returning employee) ──
  fastify.post('/scans/verify-device', async (request, reply) => {
    const { deviceId, token } = request.body as { deviceId: string; token: string };

    try {
      jwt.verify(token, SCAN_SECRET); // Just verify token is valid

      const device = await fastify.prisma.employeeDevice.findUnique({
        where: { deviceId },
        include: {
          employee: { select: { id: true, name: true, role: true, status: true } }
        }
      });

      if (!device || device.employee.status !== 'active') {
        return reply.status(404).send({ error: 'Device not registered. Please register first.' });
      }

      // Get today's scans for this employee
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const scans = await fastify.prisma.attendanceScan.findMany({
        where: { employeeId: device.employeeId, scanTime: { gte: todayStart } },
        orderBy: { scanTime: 'asc' }
      });

      const lastScan = scans.length > 0 ? scans[scans.length - 1] : null;
      const lunchMinutes = calcLunchMinutes(scans);

      return {
        employee: device.employee,
        lastScanType: lastScan?.type || null,
        lastScanTime: lastScan?.scanTime || null,
        todayScans: scans.map(s => ({ type: s.type, time: s.scanTime })),
        lunchMinutes,
        allowedActions: VALID_NEXT[lastScan?.type || ''] || ['IN']
      };
    } catch (err) {
      return reply.status(401).send({ error: 'Invalid or expired QR token' });
    }
  });

  // ── 5. Record a Scan (With Device Validation, Geofencing, Lunch) ──
  fastify.post('/scans', async (request, reply) => {
    const { employeeId, type, token, lat, lon, deviceId } = request.body as {
      employeeId: string;
      type: 'IN' | 'OUT' | 'LUNCH_START' | 'LUNCH_END';
      token: string;
      lat?: number;
      lon?: number;
      deviceId?: string;
    };

    try {
      // 1. Token Validation
      const decoded = jwt.verify(token, SCAN_SECRET) as any;
      const todayDate = new Date().toISOString().split('T')[0];
      if (decoded.date !== todayDate) {
        return reply.status(403).send({ error: 'This QR code has expired.' });
      }

      // 2. Device Validation — prevent impersonation
      if (deviceId) {
        const device = await fastify.prisma.employeeDevice.findUnique({
          where: { deviceId }
        });
        if (!device || device.employeeId !== employeeId) {
          return reply.status(403).send({ error: 'This device is not registered to this employee.' });
        }
      }

      // 3. Fetch User/Company for Geofencing
      const user = await fastify.prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { officeLat: true, officeLon: true }
      });

      // 4. Geofencing Check
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

      // 5. Sequence Validation
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const todayScans = await fastify.prisma.attendanceScan.findMany({
        where: { employeeId, scanTime: { gte: todayStart } },
        orderBy: { scanTime: 'asc' }
      });
      const lastScan = todayScans.length > 0 ? todayScans[todayScans.length - 1] : null;
      const lastType = lastScan?.type || '';
      const allowed = VALID_NEXT[lastType] || ['IN'];

      if (!allowed.includes(type)) {
        const messages: Record<string, string> = {
          'IN': 'You are already checked in.',
          'OUT': 'You must check in first.',
          'LUNCH_START': lastType === 'LUNCH_START' ? 'You are already on lunch break.' : 'You can only start lunch after checking in.',
          'LUNCH_END': 'You are not currently on lunch break.',
        };
        return reply.status(400).send({ error: messages[type] || 'Invalid action sequence.' });
      }

      // 6. Save Scan
      const scan = await fastify.prisma.attendanceScan.create({
        data: {
          employeeId,
          type,
          latitude: lat,
          longitude: lon,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          deviceId
        },
      });

      // 7. Calculate lunch duration for response
      const allScans = [...todayScans, { type, scanTime: scan.scanTime }];
      const lunchMinutes = calcLunchMinutes(allScans);

      return {
        success: true,
        scanTime: scan.scanTime,
        lunchMinutes,
        allowedActions: VALID_NEXT[type] || ['IN']
      };
    } catch (err) {
      return reply.status(401).send({ error: 'Verification failed. Please try again.' });
    }
  });

  // ── 6. My Profile — Get (device-auth) ──
  fastify.get('/scans/my-profile', async (request, reply) => {
    const deviceId = request.headers['x-device-id'] as string;
    if (!deviceId) return reply.status(401).send({ error: 'Device not identified' });

    const device = await fastify.prisma.employeeDevice.findUnique({
      where: { deviceId },
      include: {
        employee: {
          select: {
            id: true, name: true, role: true, phone: true,
            emergencyContact: true, address: true, joiningDate: true,
            basicSalary: true, status: true
          }
        }
      }
    });

    if (!device) return reply.status(404).send({ error: 'Device not registered' });

    // Get recent scans (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentScans = await fastify.prisma.attendanceScan.findMany({
      where: { employeeId: device.employeeId, scanTime: { gte: thirtyDaysAgo } },
      orderBy: { scanTime: 'desc' },
      take: 100
    });

    // Group scans by date and calculate lunch duration per day
    const byDate: Record<string, any[]> = {};
    for (const scan of recentScans) {
      const date = new Date(scan.scanTime).toISOString().split('T')[0];
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push({ type: scan.type, time: scan.scanTime });
    }

    const dailySummary = Object.entries(byDate).map(([date, scans]) => {
      scans.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
      const firstIn = scans.find(s => s.type === 'IN');
      const lastOut = [...scans].reverse().find(s => s.type === 'OUT');
      const lunchMinutes = calcLunchMinutes(scans);
      let workMinutes = 0;
      if (firstIn && lastOut) {
        workMinutes = Math.round((new Date(lastOut.time).getTime() - new Date(firstIn.time).getTime()) / 60000) - lunchMinutes;
      }
      return { date, scans, lunchMinutes, workMinutes, checkIn: firstIn?.time, checkOut: lastOut?.time };
    });

    return {
      employee: device.employee,
      dailySummary
    };
  });

  // ── 7. My Profile — Update (device-auth, limited fields) ──
  fastify.put('/scans/my-profile', async (request, reply) => {
    const deviceId = request.headers['x-device-id'] as string;
    if (!deviceId) return reply.status(401).send({ error: 'Device not identified' });

    const device = await fastify.prisma.employeeDevice.findUnique({ where: { deviceId } });
    if (!device) return reply.status(404).send({ error: 'Device not registered' });

    const { phone, emergencyContact, address } = request.body as {
      phone?: string;
      emergencyContact?: string;
      address?: string;
    };

    // Only allow updating these specific fields
    const updated = await fastify.prisma.employee.update({
      where: { id: device.employeeId },
      data: {
        ...(phone !== undefined && { phone }),
        ...(emergencyContact !== undefined && { emergencyContact }),
        ...(address !== undefined && { address }),
      },
      select: {
        id: true, name: true, role: true, phone: true,
        emergencyContact: true, address: true, joiningDate: true
      }
    });

    return { success: true, employee: updated };
  });

  // ── 8. Admin: Reset Employee PIN ──
  fastify.delete('/scans/reset-pin/:employeeId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { employeeId } = request.params as { employeeId: string };

    // Verify employee belongs to this admin
    const emp = await fastify.prisma.employee.findFirst({
      where: { id: employeeId, userId: (request as any).userId }
    });
    if (!emp) return reply.status(404).send({ error: 'Employee not found' });

    // Delete all device registrations for this employee
    await fastify.prisma.employeeDevice.deleteMany({ where: { employeeId } });

    return { success: true, message: `PIN reset for ${emp.name}. They will need to re-register.` };
  });
};

export default scanRoutes;
