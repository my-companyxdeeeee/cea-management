import { expect, it } from 'vitest'; import { setAvailability } from './set-availability.js';
const pool = { connect: async () => ({ query: async () => ({ rows: [] }), release() {} }) } as any;
it('guarda una franja semanal', async () => await expect(setAvailability(pool, { tenantId:'11111111-1111-4111-8111-111111111111', instructorId:'22222222-2222-4222-8222-222222222222', weekday:1, startsAt:'08:00', endsAt:'12:00' })).resolves.toMatchObject({ weekday:1 }));
