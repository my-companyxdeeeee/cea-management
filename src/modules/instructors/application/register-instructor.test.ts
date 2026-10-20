import { describe, expect, it } from 'vitest';
import { registerInstructor } from './register-instructor.js';
const pool = (code?: string) => ({ connect: async () => ({ query: async (sql: string) => { if (sql.startsWith('INSERT') && code) throw { code }; if (sql.startsWith('INSERT')) return { rows: [{ id: 'instructor-1', is_active: true }] }; return { rows: [] }; }, release() {} }) }) as any;
const input = { tenantId: '11111111-1111-4111-8111-111111111111', userId: '22222222-2222-4222-8222-222222222222', fullName: ' Ana Ruiz ', credentialNumber: 'LIC-1', licenseCategories: ['B1'] };
describe('registerInstructor', () => {
  it('registra una credencial vigente', async () => await expect(registerInstructor(pool(), input)).resolves.toEqual({ id: 'instructor-1', is_active: true }));
  it('traduce usuario inexistente', async () => await expect(registerInstructor(pool('23503'), input)).rejects.toMatchObject({ code: 'INSTRUCTOR_USER_INVALID' }));
});
