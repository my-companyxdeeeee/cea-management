import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { pool } from '../../../../infrastructure/database/pool.js';
import { registerStudent } from '../../application/register-student.js';
const body = z.object({ documentNumber: z.string().trim().min(5).max(30), fullName: z.string().trim().min(3).max(160), licenseCategory: z.enum(['A1', 'A2', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3']) });
export async function studentRoutes(app: FastifyInstance) {
  app.post('/students', { preHandler: [app.authenticate] }, async (request, reply) => {
    const actor = request.user;
    if (!['CEA_ADMIN', 'RECEPTION'].includes(actor.role)) return reply.forbidden();
    return reply.code(201).send(await registerStudent(pool, { tenantId: actor.tenantId, ...body.parse(request.body) }));
  });
}
