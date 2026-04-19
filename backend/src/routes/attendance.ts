// ─── Attendance Routes ──────────────────────────────────────────────────────
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { authenticate } from '../plugins/auth';

const attendanceRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.addHook('preHandler', authenticate);

  // GET /attendance/:month/:year — get attendance for all employees for a month
  fastify.get('/attendance/:month/:year', async (request, reply) => {
    const { month, year } = request.params as { month: string; year: string };
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);

    if (isNaN(m) || isNaN(y) || m < 1 || m > 12) {
      return reply.status(400).send({ error: 'Invalid month or year' });
    }

    // Get all employees for this user
    const employees = await fastify.prisma.employee.findMany({
      where: { userId: request.userId, status: 'active' },
      orderBy: { name: 'asc' },
    });

    // Get attendance records for this month
    const attendanceLogs = await fastify.prisma.attendanceLog.findMany({
      where: {
        month: m,
        year: y,
        employeeId: { in: employees.map(e => e.id) },
      },
    });

    // Map attendance to employees (include employees without records)
    const result = employees.map(emp => {
      const log = attendanceLogs.find(a => a.employeeId === emp.id);
      return {
        employeeId: emp.id,
        employeeName: emp.name,
        employeeRole: emp.role,
        month: m,
        year: y,
        presentDays: log?.presentDays ?? 0,
        paidLeaveDays: log?.paidLeaveDays ?? 0,
        unpaidLeaveDays: log?.unpaidLeaveDays ?? 0,
        overtimeHours: log ? Number(log.overtimeHours) : 0,
        id: log?.id ?? null,
      };
    });

    return reply.send(result);
  });

  // POST /attendance — bulk upsert attendance for a month
  fastify.post('/attendance', async (request, reply) => {
    const body = request.body as Array<{
      employeeId: string;
      month: number;
      year: number;
      presentDays: number;
      paidLeaveDays: number;
      unpaidLeaveDays: number;
      overtimeHours: number;
    }>;

    if (!Array.isArray(body) || body.length === 0) {
      return reply.status(400).send({ error: 'Expected an array of attendance records' });
    }

    // Verify all employees belong to this user
    const employeeIds = body.map(r => r.employeeId);
    const validEmployees = await fastify.prisma.employee.findMany({
      where: { id: { in: employeeIds }, userId: request.userId },
      select: { id: true },
    });
    const validIds = new Set(validEmployees.map(e => e.id));

    const results = [];
    for (const record of body) {
      if (!validIds.has(record.employeeId)) continue;

      const upserted = await fastify.prisma.attendanceLog.upsert({
        where: {
          employeeId_month_year: {
            employeeId: record.employeeId,
            month: record.month,
            year: record.year,
          },
        },
        update: {
          presentDays: record.presentDays,
          paidLeaveDays: record.paidLeaveDays,
          unpaidLeaveDays: record.unpaidLeaveDays,
          overtimeHours: record.overtimeHours,
        },
        create: {
          employeeId: record.employeeId,
          month: record.month,
          year: record.year,
          presentDays: record.presentDays,
          paidLeaveDays: record.paidLeaveDays,
          unpaidLeaveDays: record.unpaidLeaveDays,
          overtimeHours: record.overtimeHours,
        },
      });
      results.push(upserted);
    }

    return reply.send({ saved: results.length, records: results });
  });
};

export default attendanceRoutes;
