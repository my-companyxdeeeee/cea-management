import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { pool } from '../../../../infrastructure/database/pool.js';
import { registerInstructor } from '../../application/register-instructor.js';
const body = z.object({ userId: z.string().uuid(), fullName: z.string().trim().min(3).max(160), credentialNumber: z.string().trim().min(2).max(80), credentialExpiresAt: z.coerce.date().optional(), licenseCategories: z.array(z.enum(['A1', 'A2', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'])).min(1).max(8) });
export async function instructorRoutes(app: FastifyInstance) {
  app.post('/instructors', { preHandler: [app.authenticate] }, async (request, reply) => {
    const actor = request.user;
    if (actor.role !== 'CEA_ADMIN') return reply.forbidden();
    return reply.code(201).send(await registerInstructor(pool, { tenantId: actor.tenantId, ...body.parse(request.body) }));
  });
}
