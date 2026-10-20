import type { Pool } from 'pg';
import { inTenantTransaction } from '../../../infrastructure/database/tenant-transaction.js';
import { DomainError } from '../../../shared/domain/errors.js';
export async function reportMechanicalIssue(pool: Pool, input: { tenantId: string; vehicleId: string; active: boolean; note?: string }) {
  return inTenantTransaction(pool, input.tenantId, async client => {
    const result = await client.query<{ id: string }>(
      'UPDATE vehicles SET mechanical_issue_active=$1, mechanical_issue_note=$2, is_available=CASE WHEN $1 THEN false ELSE (soat_expires_at IS NULL OR soat_expires_at >= current_date) AND (tecnomecanica_expires_at IS NULL OR tecnomecanica_expires_at >= current_date) END WHERE tenant_id=$3 AND id=$4 RETURNING id',
      [input.active, input.note?.trim() ?? null, input.tenantId, input.vehicleId]
    );
    if (!result.rowCount) throw new DomainError('El vehículo no existe o no pertenece al CEA.', 'VEHICLE_NOT_FOUND');
    return { vehicleId: result.rows[0].id, mechanicalIssueActive: input.active };
  });
}
