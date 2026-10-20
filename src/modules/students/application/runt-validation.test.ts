import { describe, expect, it } from 'vitest';
import { validateStudentWithRunt } from './runt-validation.js';
const pool = () => ({ connect: async () => ({ query: async (sql: string) => sql.startsWith('SELECT') ? { rows: [{ document_number: '123', license_category: 'B1' }], rowCount: 1 } : { rows: [] }, release() {} }) }) as any;
const input = { tenantId: '11111111-1111-4111-8111-111111111111', studentId: '22222222-2222-4222-8222-222222222222' };
describe('validateStudentWithRunt', () => {
  it('persiste resultado válido del adaptador', async () => await expect(validateStudentWithRunt(pool(), { validate: async () => 'VALID' }, input)).resolves.toEqual({ studentId: input.studentId, runtStatus: 'VALID' }));
  it('persiste bloqueo reportado por RUNT', async () => await expect(validateStudentWithRunt(pool(), { validate: async () => 'BLOCKED' }, input)).resolves.toEqual({ studentId: input.studentId, runtStatus: 'BLOCKED' }));
});
