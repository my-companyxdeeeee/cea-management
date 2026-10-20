import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { pool } from '../../../../infrastructure/database/pool.js';
import { createAppointment } from '../../application/create-appointment.js';

const body = z.object({ studentId: z.string().uuid(), instructorId: z.string().uuid().optional(), vehicleId: z.string().uuid().optional(), kind: z.enum(['THEORY', 'PRACTICAL']), startsAt: z.coerce.date(), endsAt: z.coerce.date() });
export async function schedulingRoutes(app: FastifyInstance) {
  app.post('/appointments', { preHandler: [app.authenticate] }, async (request, reply) => {
    const actor = request.user as { tenantId: string; role: string };
    if (!['CEA_ADMIN', 'RECEPTION'].includes(actor.role)) return reply.forbidden();
    const appointment = await createAppointment(pool, { tenantId: actor.tenantId, ...body.parse(request.body) });
    return reply.code(201).send(appointment);
  });
}
