import type { Pool } from 'pg';
import { inTenantTransaction } from '../../../infrastructure/database/tenant-transaction.js';
import { DomainError } from '../../../shared/domain/errors.js';
export type RegisterInstructor = { tenantId: string; userId: string; fullName: string; credentialNumber: string; credentialExpiresAt?: Date; licenseCategories: string[] };
export async function registerInstructor(pool: Pool, input: RegisterInstructor) {
  try {
    return await inTenantTransaction(pool, input.tenantId, client => client.query<{ id: string; is_active: boolean }>(
      `INSERT INTO instructors (tenant_id, user_id, full_name, credential_number, credential_expires_at, license_categories, is_active)
       VALUES ($1,$2,$3,$4,$5,$6, ($5 IS NULL OR $5 >= current_date)) RETURNING id, is_active`,
      [input.tenantId, input.userId, input.fullName.trim(), input.credentialNumber.trim(), input.credentialExpiresAt ?? null, input.licenseCategories]
    ).then(result => result.rows[0]));
  } catch (error: any) {
    if (error?.code === '23505') throw new DomainError('El usuario ya está registrado como instructor en este CEA.', 'INSTRUCTOR_EXISTS');
    if (error?.code === '23503') throw new DomainError('El usuario no existe dentro de este CEA.', 'INSTRUCTOR_USER_INVALID');
    throw error;
  }
}
