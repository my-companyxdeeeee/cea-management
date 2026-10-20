import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { pool } from '../../../../infrastructure/database/pool.js';
import { DomainError } from '../../../../shared/domain/errors.js';
import { UnavailableRuntGateway, validateStudentWithRunt } from '../../application/runt-validation.js';
export async function runtRoutes(app: FastifyInstance) {
  app.post('/students/:studentId/runt-validation', { preHandler: [app.authenticate] }, async (request, reply) => {
    const actor = request.user; if (!['CEA_ADMIN', 'RECEPTION'].includes(actor.role)) return reply.forbidden();
    const { studentId } = z.object({ studentId: z.string().uuid() }).parse(request.params);
    try { return reply.send(await validateStudentWithRunt(pool, new UnavailableRuntGateway(), { tenantId: actor.tenantId, studentId })); }
    catch (error) { if (error instanceof DomainError && error.code === 'RUNT_UNAVAILABLE') return reply.code(503).send({ code: error.code, message: error.message }); throw error; }
  });
}
