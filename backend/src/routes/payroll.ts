// ─── Payroll Routes ─────────────────────────────────────────────────────────
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { authenticate } from '../plugins/auth';
import { calculatePayroll, EmployeeInput, AttendanceInput, BonusInput } from '../services/payrollEngine';
import { generatePayslipPDF } from '../services/pdfService';
import { generatePayrollExcel } from '../services/excelService';
import { Decimal } from '@prisma/client/runtime/library';

const payrollRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.addHook('preHandler', authenticate);

  // POST /payroll/run — Run payroll for all active employees for a given month/year
  fastify.post('/payroll/run', async (request, reply) => {
    const { month, year } = request.body as { month: number; year: number };

    if (!month || !year || month < 1 || month > 12) {
      return reply.status(400).send({ error: 'Valid month and year are required' });
    }

    // Get all active employees for this user
    const employees = await fastify.prisma.employee.findMany({
      where: { userId: request.userId, status: 'active' },
    });

    if (employees.length === 0) {
      return reply.status(400).send({ error: 'No active employees found' });
    }

    // Get attendance for all employees
    const attendanceLogs = await fastify.prisma.attendanceLog.findMany({
      where: {
        month,
        year,
        employeeId: { in: employees.map(e => e.id) },
      },
    });

    // Get bonuses for all employees
    const bonusEvents = await fastify.prisma.bonusEvent.findMany({
      where: {
        month,
        year,
        employeeId: { in: employees.map(e => e.id) },
      },
    });

    // Calculate payroll for each employee
    const payslipData: Array<{
      employeeId: string;
      breakdown: ReturnType<typeof calculatePayroll>;
      netPay: number;
    }> = [];

    let totalPayout = 0;

    for (const emp of employees) {
      const empInput: EmployeeInput = {
        basicSalary: Number(emp.basicSalary),
        hra: Number(emp.hra),
        pfEnabled: emp.pfEnabled,
        esiEnabled: emp.esiEnabled,
        joiningDate: emp.joiningDate,
      };

      const attLog = attendanceLogs.find(a => a.employeeId === emp.id);
      const attInput: AttendanceInput = {
        month,
        year,
        presentDays: attLog?.presentDays ?? 0,
        paidLeaveDays: attLog?.paidLeaveDays ?? 0,
        unpaidLeaveDays: attLog?.unpaidLeaveDays ?? 0,
        overtimeHours: attLog ? Number(attLog.overtimeHours) : 0,
      };

      const empBonuses: BonusInput[] = bonusEvents
        .filter(b => b.employeeId === emp.id)
        .map(b => ({ label: b.label, amount: Number(b.amount) }));

      const breakdown = calculatePayroll(empInput, attInput, empBonuses);
      totalPayout += breakdown.netPay;

      payslipData.push({
        employeeId: emp.id,
        breakdown,
        netPay: breakdown.netPay,
      });
    }

    // Upsert payroll run
    const payrollRun = await fastify.prisma.payrollRun.upsert({
      where: {
        userId_month_year: {
          userId: request.userId,
          month,
          year,
        },
      },
      update: {
        status: 'processed',
        runAt: new Date(),
        totalPayout,
      },
      create: {
        userId: request.userId,
        month,
        year,
        status: 'processed',
        runAt: new Date(),
        totalPayout,
      },
    });

    // Delete old payslips for this run (re-run scenario)
    await fastify.prisma.payslip.deleteMany({
      where: { payrollRunId: payrollRun.id },
    });

    // Create payslips
    const payslips = await Promise.all(
      payslipData.map(ps =>
        fastify.prisma.payslip.create({
          data: {
            payrollRunId: payrollRun.id,
            employeeId: ps.employeeId,
            breakdown: ps.breakdown as any,
            netPay: ps.netPay,
          },
        })
      )
    );

    return reply.send({
      payrollRun: {
        ...payrollRun,
        totalPayout: Number(payrollRun.totalPayout),
      },
      payslips: payslips.map(ps => ({
        ...ps,
        netPay: Number(ps.netPay),
      })),
    });
  });

  // GET /payroll/:month/:year — Get payroll run with all payslip breakdowns
  fastify.get('/payroll/:month/:year', async (request, reply) => {
    const { month, year } = request.params as { month: string; year: string };
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);

    const payrollRun = await fastify.prisma.payrollRun.findUnique({
      where: {
        userId_month_year: {
          userId: request.userId,
          month: m,
          year: y,
        },
      },
      include: {
        payslips: {
          include: {
            employee: true,
          },
        },
      },
    });

    if (!payrollRun) {
      // Return empty state with employee list for preview
      const employees = await fastify.prisma.employee.findMany({
        where: { userId: request.userId, status: 'active' },
        orderBy: { name: 'asc' },
      });

      // Get attendance and bonuses for preview calculations
      const attendanceLogs = await fastify.prisma.attendanceLog.findMany({
        where: {
          month: m,
          year: y,
          employeeId: { in: employees.map(e => e.id) },
        },
      });

      const bonusEvents = await fastify.prisma.bonusEvent.findMany({
        where: {
          month: m,
          year: y,
          employeeId: { in: employees.map(e => e.id) },
        },
      });

      // Calculate preview breakdowns
      const previews = employees.map(emp => {
        const attLog = attendanceLogs.find(a => a.employeeId === emp.id);
        const empBonuses = bonusEvents
          .filter(b => b.employeeId === emp.id)
          .map(b => ({ label: b.label, amount: Number(b.amount) }));

        const breakdown = calculatePayroll(
          {
            basicSalary: Number(emp.basicSalary),
            hra: Number(emp.hra),
            pfEnabled: emp.pfEnabled,
            esiEnabled: emp.esiEnabled,
            joiningDate: emp.joiningDate,
          },
          {
            month: m,
            year: y,
            presentDays: attLog?.presentDays ?? 0,
            paidLeaveDays: attLog?.paidLeaveDays ?? 0,
            unpaidLeaveDays: attLog?.unpaidLeaveDays ?? 0,
            overtimeHours: attLog ? Number(attLog.overtimeHours) : 0,
          },
          empBonuses
        );

        return {
          employee: {
            ...emp,
            basicSalary: Number(emp.basicSalary),
            hra: Number(emp.hra),
          },
          breakdown,
        };
      });

      return reply.send({
        payrollRun: null,
        status: 'draft',
        month: m,
        year: y,
        totalPayout: previews.reduce((sum, p) => sum + p.breakdown.netPay, 0),
        payslips: previews,
      });
    }

    return reply.send({
      payrollRun: {
        ...payrollRun,
        totalPayout: Number(payrollRun.totalPayout),
      },
      status: payrollRun.status,
      month: m,
      year: y,
      totalPayout: Number(payrollRun.totalPayout),
      payslips: payrollRun.payslips.map(ps => ({
        id: ps.id,
        employee: {
          ...ps.employee,
          basicSalary: Number(ps.employee.basicSalary),
          hra: Number(ps.employee.hra),
        },
        breakdown: ps.breakdown,
        netPay: Number(ps.netPay),
        generatedAt: ps.generatedAt,
      })),
    });
  });

  // GET /payslip/:id/pdf — Generate and return PDF for a single payslip
  fastify.get('/payslip/:id/pdf', async (request, reply) => {
    const { id } = request.params as { id: string };

    const payslip = await fastify.prisma.payslip.findUnique({
      where: { id },
      include: {
        employee: true,
        payrollRun: {
          include: { user: true },
        },
      },
    });

    if (!payslip || payslip.payrollRun.userId !== request.userId) {
      return reply.status(404).send({ error: 'Payslip not found' });
    }

    const companyName = payslip.payrollRun.user.companyName || process.env.COMPANY_NAME || 'PayLite Company';

    const pdfBuffer = await generatePayslipPDF({
      companyName,
      employeeName: payslip.employee.name,
      employeeRole: payslip.employee.role,
      month: payslip.payrollRun.month,
      year: payslip.payrollRun.year,
      breakdown: payslip.breakdown as any,
      netPay: Number(payslip.netPay),
    });

    reply.header('Content-Type', 'application/pdf');
    reply.header('Content-Disposition', `attachment; filename=payslip-${payslip.employee.name.replace(/\s+/g, '_')}-${payslip.payrollRun.month}-${payslip.payrollRun.year}.pdf`);
    return reply.send(pdfBuffer);
  });

  // GET /payroll/export/:month/:year — Export Excel for the full month
  fastify.get('/payroll/export/:month/:year', async (request, reply) => {
    const { month, year } = request.params as { month: string; year: string };
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);

    const payrollRun = await fastify.prisma.payrollRun.findUnique({
      where: {
        userId_month_year: {
          userId: request.userId,
          month: m,
          year: y,
        },
      },
      include: {
        payslips: {
          include: { employee: true },
        },
        user: true,
      },
    });

    if (!payrollRun) {
      return reply.status(404).send({ error: 'No payroll run found for this month' });
    }

    const companyName = payrollRun.user.companyName || process.env.COMPANY_NAME || 'PayLite Company';

    const excelBuffer = await generatePayrollExcel({
      companyName,
      month: m,
      year: y,
      payslips: payrollRun.payslips.map(ps => ({
        employeeName: ps.employee.name,
        employeeRole: ps.employee.role,
        breakdown: ps.breakdown as any,
        netPay: Number(ps.netPay),
      })),
      totalPayout: Number(payrollRun.totalPayout),
    });

    reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    reply.header('Content-Disposition', `attachment; filename=payroll-${m}-${y}.xlsx`);
    return reply.send(excelBuffer);
  });
};

export default payrollRoutes;
