// ─── Auth Routes ────────────────────────────────────────────────────────────
import { FastifyInstance, FastifyPluginAsync } from 'fastify';

const authRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // POST /auth/login — Sign in with email + password via Supabase
  fastify.post('/auth/login', async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };

    if (!email || !password) {
      return reply.status(400).send({ error: 'Email and password are required' });
    }

    const { data, error } = await fastify.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return reply.status(401).send({ error: error.message });
    }

    // Ensure user exists in our users table
    const existingUser = await fastify.prisma.user.findUnique({
      where: { id: data.user.id },
    });

    if (!existingUser) {
      // First login — create user record
      await fastify.prisma.user.create({
        data: {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name || email.split('@')[0],
          companyName: data.user.user_metadata?.companyName || 'My Company',
        },
      });
    }

    return reply.send({
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: existingUser?.name || email.split('@')[0],
        companyName: existingUser?.companyName || 'My Company',
      },
    });
  });

  // GET /auth/profile — Get company settings
  fastify.get('/auth/profile', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = (request as any).userId;
    const user = await fastify.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, companyName: true, officeLat: true, officeLon: true }
    });
    return reply.send(user);
  });

  // PUT /auth/profile — Update company settings
  fastify.post('/auth/profile', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = (request as any).userId;
    const body = request.body as { companyName?: string; name?: string; officeLat?: number; officeLon?: number };
    
    const updated = await fastify.prisma.user.update({
      where: { id: userId },
      data: body,
    });
    return reply.send(updated);
  });
};

export default authRoutes;
