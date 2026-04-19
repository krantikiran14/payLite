// ─── Employee Routes ────────────────────────────────────────────────────────
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { authenticate } from '../plugins/auth';

const employeeRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // All employee routes require authentication
  fastify.addHook('preHandler', authenticate);

  // GET /employees — list all employees for authenticated user
  fastify.get('/employees', async (request, reply) => {
    const employees = await fastify.prisma.employee.findMany({
      where: { userId: request.userId },
      orderBy: { name: 'asc' },
    });

    return reply.send(employees);
  });

  // POST /employees — create a new employee
  fastify.post('/employees', async (request, reply) => {
    const body = request.body as {
      name: string;
      role: string;
      basicSalary: number;
      hra: number;
      pfEnabled?: boolean;
      esiEnabled?: boolean;
      joiningDate: string;
      status?: 'active' | 'inactive';
    };

    if (!body.name || !body.role || body.basicSalary == null || body.hra == null || !body.joiningDate) {
      return reply.status(400).send({ error: 'name, role, basicSalary, hra, and joiningDate are required' });
    }

    const employee = await fastify.prisma.employee.create({
      data: {
        userId: request.userId,
        name: body.name,
        role: body.role,
        basicSalary: body.basicSalary,
        hra: body.hra,
        pfEnabled: body.pfEnabled ?? true,
        esiEnabled: body.esiEnabled ?? true,
        joiningDate: new Date(body.joiningDate),
        status: body.status || 'active',
      },
    });

    return reply.status(201).send(employee);
  });

  // PUT /employees/:id — update an employee
  fastify.put('/employees/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Partial<{
      name: string;
      role: string;
      basicSalary: number;
      hra: number;
      pfEnabled: boolean;
      esiEnabled: boolean;
      joiningDate: string;
      status: 'active' | 'inactive';
    }>;

    // Verify the employee belongs to this user
    const existing = await fastify.prisma.employee.findFirst({
      where: { id, userId: request.userId },
    });

    if (!existing) {
      return reply.status(404).send({ error: 'Employee not found' });
    }

    const updateData: any = { ...body };
    if (body.joiningDate) {
      updateData.joiningDate = new Date(body.joiningDate);
    }

    const employee = await fastify.prisma.employee.update({
      where: { id },
      data: updateData,
    });

    return reply.send(employee);
  });
};

export default employeeRoutes;
