// ─── Bonus Routes ───────────────────────────────────────────────────────────
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { authenticate } from '../plugins/auth';

const bonusRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.addHook('preHandler', authenticate);

  // GET /bonuses/:month/:year — get all bonuses for a month
  fastify.get('/bonuses/:month/:year', async (request, reply) => {
    const { month, year } = request.params as { month: string; year: string };
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);

    // Get employee IDs belonging to this user
    const employees = await fastify.prisma.employee.findMany({
      where: { userId: request.userId },
      select: { id: true },
    });
    const empIds = employees.map(e => e.id);

    const bonuses = await fastify.prisma.bonusEvent.findMany({
      where: {
        month: m,
        year: y,
        employeeId: { in: empIds },
      },
      include: {
        employee: { select: { name: true, role: true } },
      },
    });

    return reply.send(bonuses);
  });

  // POST /bonuses — create a bonus event
  fastify.post('/bonuses', async (request, reply) => {
    const body = request.body as {
      employeeId: string;
      month: number;
      year: number;
      label: string;
      amount: number;
    };

    if (!body.employeeId || !body.month || !body.year || !body.label || body.amount == null) {
      return reply.status(400).send({ error: 'employeeId, month, year, label, and amount are required' });
    }

    // Verify employee belongs to user
    const emp = await fastify.prisma.employee.findFirst({
      where: { id: body.employeeId, userId: request.userId },
    });
    if (!emp) {
      return reply.status(404).send({ error: 'Employee not found' });
    }

    const bonus = await fastify.prisma.bonusEvent.create({
      data: {
        employeeId: body.employeeId,
        month: body.month,
        year: body.year,
        label: body.label,
        amount: body.amount,
      },
    });

    return reply.status(201).send(bonus);
  });

  // DELETE /bonuses/:id — delete a bonus event
  fastify.delete('/bonuses/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    // Verify ownership via employee → user chain
    const bonus = await fastify.prisma.bonusEvent.findUnique({
      where: { id },
      include: { employee: { select: { userId: true } } },
    });

    if (!bonus || bonus.employee.userId !== request.userId) {
      return reply.status(404).send({ error: 'Bonus not found' });
    }

    await fastify.prisma.bonusEvent.delete({ where: { id } });
    return reply.send({ message: 'Bonus deleted' });
  });
};

export default bonusRoutes;
