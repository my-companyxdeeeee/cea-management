import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { pool } from '../../../../infrastructure/database/pool.js';
import { registerVehicle } from '../../application/register-vehicle.js';
import { reportMechanicalIssue } from '../../application/report-mechanical-issue.js';
const body = z.object({ plate: z.string().trim().min(3).max(10), brand: z.string().trim().min(1).max(80), model: z.string().trim().min(1).max(40), category: z.enum(['A1', 'A2', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3']), mileageKm: z.number().int().nonnegative(), soatExpiresAt: z.coerce.date().optional(), tecnomecanicaExpiresAt: z.coerce.date().optional() });
export async function fleetRoutes(app: FastifyInstance) {
  app.post('/vehicles', { preHandler: [app.authenticate] }, async (request, reply) => {
    const actor = request.user;
    if (actor.role !== 'CEA_ADMIN') return reply.forbidden();
    return reply.code(201).send(await registerVehicle(pool, { tenantId: actor.tenantId, ...body.parse(request.body) }));
  });
  app.patch('/vehicles/:vehicleId/mechanical-issue', { preHandler: [app.authenticate] }, async (request, reply) => {
    const actor = request.user; const params = z.object({ vehicleId: z.string().uuid() }).parse(request.params);
    const issue = z.object({ active: z.boolean(), note: z.string().max(500).optional() }).parse(request.body);
    if (issue.active && actor.role !== 'INSTRUCTOR') return reply.forbidden();
    if (!issue.active && actor.role !== 'CEA_ADMIN') return reply.forbidden();
    return reply.send(await reportMechanicalIssue(pool, { tenantId: actor.tenantId, vehicleId: params.vehicleId, ...issue }));
  });
}
