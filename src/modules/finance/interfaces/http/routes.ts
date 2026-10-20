import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { pool } from '../../../../infrastructure/database/pool.js';
import { createPackage, recordPayment, setCreditLimit, getStudentAccount } from '../../application/finance.js';
const packageBody = z.object({ name: z.string().trim().min(2).max(100), totalClasses: z.number().int().positive(), price: z.number().nonnegative() });
const paymentBody = z.object({ amount: z.number().positive(), method: z.enum(['CASH', 'TRANSFER', 'ONLINE']), reference: z.string().max(120).optional() });
export async function financeRoutes(app: FastifyInstance) {
  app.post('/packages', { preHandler: [app.authenticate] }, async (request, reply) => { const actor = request.user; if (!['CEA_ADMIN', 'RECEPTION'].includes(actor.role)) return reply.forbidden(); return reply.code(201).send(await createPackage(pool, { tenantId: actor.tenantId, ...packageBody.parse(request.body) })); });
  app.post('/students/:studentId/payments', { preHandler: [app.authenticate] }, async (request, reply) => { const actor = request.user; if (!['CEA_ADMIN', 'RECEPTION'].includes(actor.role)) return reply.forbidden(); const body = paymentBody.parse(request.body); const params = z.object({ studentId: z.string().uuid() }).parse(request.params); return reply.code(201).send(await recordPayment(pool, { tenantId: actor.tenantId, studentId: params.studentId, ...body })); });
  app.patch('/finance/credit-limit', { preHandler: [app.authenticate] }, async (request, reply) => { const actor = request.user; if (actor.role !== 'CEA_ADMIN') return reply.forbidden(); const body = z.object({ creditLimit: z.number().nonnegative().nullable() }).parse(request.body); return reply.send(await setCreditLimit(pool, actor.tenantId, body.creditLimit)); });
  app.get('/students/:studentId/account', { preHandler: [app.authenticate] }, async (request, reply) => { const actor=request.user; if(!['STUDENT','CEA_ADMIN','RECEPTION'].includes(actor.role)) return reply.forbidden(); const p=z.object({studentId:z.string().uuid()}).parse(request.params); if(actor.role==='STUDENT' && actor.userId!==p.studentId) return reply.forbidden(); return reply.send(await getStudentAccount(pool,actor.tenantId,p.studentId)); });
}
