import type { Pool } from 'pg';
import { inTenantTransaction } from '../../../infrastructure/database/tenant-transaction.js';
import { DomainError } from '../../../shared/domain/errors.js';

export type RegisterStudent = { tenantId: string; documentNumber: string; fullName: string; licenseCategory: string };
export async function registerStudent(pool: Pool, input: RegisterStudent) {
  try {
    return await inTenantTransaction(pool, input.tenantId, async client => {
      const result = await client.query<{ id: string; runt_status: string }>(
        `INSERT INTO students (tenant_id, document_number, full_name, license_category)
         VALUES ($1, $2, $3, $4) RETURNING id, runt_status`,
        [input.tenantId, input.documentNumber.trim(), input.fullName.trim(), input.licenseCategory]
      );
      return result.rows[0];
    });
  } catch (error: any) {
    if (error?.code === '23505') throw new DomainError('El documento ya está registrado en este CEA.', 'STUDENT_DOCUMENT_EXISTS');
    throw error;
  }
}
