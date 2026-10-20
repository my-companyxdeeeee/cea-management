import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import sensible from '@fastify/sensible';
import { env } from './infrastructure/config/env.js';
import { schedulingRoutes } from './modules/scheduling/interfaces/http/routes.js';
const app = Fastify({ logger: true });
await app.register(sensible);
await app.register(jwt, { secret: env.JWT_SECRET });
app.decorate('authenticate', async (request: any) => request.jwtVerify());
app.get('/health', async () => ({ status: 'ok' }));
await app.register(schedulingRoutes, { prefix: '/api/v1' });
await app.listen({ port: env.PORT, host: '0.0.0.0' });

