import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { pool } from '../../../../infrastructure/database/pool.js';
import { getStudentProgress } from '../../application/get-progress.js';
export async function progressRoutes(app: FastifyInstance) { app.get('/students/:studentId/progress', { preHandler: [app.authenticate] }, async (request, reply) => { const actor = request.user; const { studentId } = z.object({ studentId: z.string().uuid() }).parse(request.params); if (actor.role === 'STUDENT' && actor.userId !== studentId) return reply.forbidden(); if (!['STUDENT', 'CEA_ADMIN', 'RECEPTION', 'INSTRUCTOR'].includes(actor.role)) return reply.forbidden(); return reply.send(await getStudentProgress(pool, actor.tenantId, studentId)); }); }
