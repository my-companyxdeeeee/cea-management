import { describe, expect, it } from 'vitest';
import { registerStudent } from './register-student.js';
const pool = (code?: string) => ({ connect: async () => ({ query: async (sql: string) => {
  if (sql.startsWith('INSERT') && code) throw { code };
  if (sql.startsWith('INSERT')) return { rows: [{ id: 'student-1', runt_status: 'PENDING' }] };
  return { rows: [] };
}, release() {} }) }) as any;
const input = { tenantId: '11111111-1111-4111-8111-111111111111', documentNumber: '123', fullName: ' Ana Ruiz ', licenseCategory: 'B1' };
describe('registerStudent', () => {
  it('crea el estudiante con validación RUNT pendiente', async () => expect(registerStudent(pool(), input)).resolves.toEqual({ id: 'student-1', runt_status: 'PENDING' }));
  it('traduce documento duplicado', async () => await expect(registerStudent(pool('23505'), input)).rejects.toMatchObject({ code: 'STUDENT_DOCUMENT_EXISTS' }));
});
