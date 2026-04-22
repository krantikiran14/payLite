// ─── Auth Plugin for Fastify — Supabase JWT validation ──────────────────────
import { FastifyInstance, FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

declare module 'fastify' {
  interface FastifyInstance {
    supabase: SupabaseClient;
    supabaseAdmin: SupabaseClient;
    authenticate: any;
  }
  interface FastifyRequest {
    userId: string;
    userEmail: string;
  }
}

const authPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  // Public client (for token verification)
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  fastify.decorate('supabase', supabase);

  // Admin client (for server-side operations like creating users in seed)
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  fastify.decorate('supabaseAdmin', supabaseAdmin);

  // Request decorators
  fastify.decorateRequest('userId', '');
  fastify.decorateRequest('userEmail', '');

  // Add authenticate to fastify instance for route hooks
  fastify.decorate('authenticate', authenticate);
};

/**
 * Authentication hook — attach to routes that require auth.
 * Validates the Bearer token via Supabase and sets request.userId.
 */
export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const { data, error } = await request.server.supabase.auth.getUser(token);
    if (error || !data.user) {
      return reply.status(401).send({ error: 'Invalid or expired token' });
    }

    request.userId = data.user.id;
    request.userEmail = data.user.email || '';
  } catch (err) {
    return reply.status(401).send({ error: 'Authentication failed' });
  }
}

export default fp(authPlugin, { name: 'auth' });
