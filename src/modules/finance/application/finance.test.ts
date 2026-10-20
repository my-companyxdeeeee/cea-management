import { describe, expect, it } from 'vitest';
import { createPackage, recordPayment } from './finance.js';
const pool = () => ({ connect: async () => ({ query: async (sql: string) => { if (sql.startsWith('INSERT INTO packages')) return { rows: [{ id: 'package-1' }] }; if (sql.includes('WITH inserted')) return { rows: [{ balance: '-100.00' }] }; return { rows: [] }; }, release() {} }) }) as any;
describe('finance', () => {
  it('crea paquetes', async () => await expect(createPackage(pool(), { tenantId: '11111111-1111-4111-8111-111111111111', name: 'B1 básico', totalClasses: 20, price: 1000 })).resolves.toEqual({ id: 'package-1' }));
  it('registra abono y devuelve saldo calculado', async () => await expect(recordPayment(pool(), { tenantId: '11111111-1111-4111-8111-111111111111', studentId: '22222222-2222-4222-8222-222222222222', amount: 100, method: 'CASH' })).resolves.toEqual({ balance: '-100.00' }));
});
