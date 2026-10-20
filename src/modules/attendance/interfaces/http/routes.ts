import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { pool } from '../../../../infrastructure/database/pool.js';
import { closeAppointment } from '../../application/close-appointment.js';
const body = z.object({ checkIn: z.coerce.date(), checkOut: z.coerce.date(), verificationMethod: z.enum(['DIGITAL', 'BIOMETRIC']), endingMileageKm: z.number().int().nonnegative().optional() });
export async function attendanceRoutes(app: FastifyInstance) {
  app.post('/appointments/:appointmentId/attendance', { preHandler: [app.authenticate] }, async (request, reply) => {
    const actor = request.user; if (actor.role !== 'INSTRUCTOR') return reply.forbidden();
    const params = z.object({ appointmentId: z.string().uuid() }).parse(request.params);
    return reply.send(await closeAppointment(pool, { tenantId: actor.tenantId, userId: actor.userId, appointmentId: params.appointmentId, ...body.parse(request.body) }));
  });
}
