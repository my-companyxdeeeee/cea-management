import { expect, it } from 'vitest';
import { getStudentProgress } from './get-progress.js';
const pool = { connect: async () => ({ query: async () => ({ rows: [], rowCount: 0 }), release() {} }) } as any;
it('devuelve progreso vacío cuando aún no hay horas', async () => await expect(getStudentProgress(pool, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222')).resolves.toEqual({ theoryHours: '0', practicalHours: '0', examsPassed: 0 }));
