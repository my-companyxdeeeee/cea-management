import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { env } from '../../../../infrastructure/config/env.js';
import { pool } from '../../../../infrastructure/database/pool.js';
import { authenticate, createRefreshSession } from '../../application/authenticate.js';
const credentials = z.object({ tenantId: z.string().uuid(), email: z.string().email(), password: z.string().min(8).max(256) });

export async function identityRoutes(app: FastifyInstance) {
  app.post('/auth/login', async (request, reply) => {
    const body = credentials.parse(request.body);
    const identity = await authenticate(pool, body.tenantId, body.email, body.password);
    const accessToken = app.jwt.sign({ userId: identity.id, tenantId: identity.tenantId, role: identity.role }, { expiresIn: env.JWT_ACCESS_TTL });
    const refreshToken = await createRefreshSession(pool, identity);
    return reply.send({ accessToken, refreshToken, tokenType: 'Bearer', expiresIn: env.JWT_ACCESS_TTL });
  });
}
