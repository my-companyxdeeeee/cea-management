import type { Pool } from 'pg';
import { inTenantTransaction } from '../../../infrastructure/database/tenant-transaction.js';
import { DomainError } from '../../../shared/domain/errors.js';
export type PackageInput = { tenantId: string; name: string; totalClasses: number; price: number };
export async function createPackage(pool: Pool, input: PackageInput) {
  try { return await inTenantTransaction(pool, input.tenantId, client => client.query<{ id: string }>('INSERT INTO packages (tenant_id,name,total_classes,price) VALUES ($1,$2,$3,$4) RETURNING id', [input.tenantId, input.name.trim(), input.totalClasses, input.price]).then(r => r.rows[0])); }
  catch (error: any) { if (error?.code === '23505') throw new DomainError('Ya existe un paquete con ese nombre.', 'PACKAGE_EXISTS'); throw error; }
}
export async function recordPayment(pool: Pool, input: { tenantId: string; studentId: string; amount: number; method: 'CASH' | 'TRANSFER' | 'ONLINE'; reference?: string }) {
  return inTenantTransaction(pool, input.tenantId, async client => {
    const result = await client.query<{ balance: string }>(
      `WITH inserted AS (INSERT INTO student_ledgers (tenant_id,student_id,entry_type,amount,payment_method,external_reference) VALUES ($1,$2,'PAYMENT',$3,$4,$5))
       SELECT COALESCE(SUM(CASE WHEN entry_type = 'CHARGE' THEN amount ELSE -amount END), 0)::text AS balance FROM student_ledgers WHERE tenant_id=$1 AND student_id=$2`,
      [input.tenantId, input.studentId, input.amount, input.method, input.reference ?? null]
    );
    return { balance: result.rows[0].balance };
  });
}
