import type { Pool } from 'pg';
import { inTenantTransaction } from '../../../infrastructure/database/tenant-transaction.js';
import { DomainError } from '../../../shared/domain/errors.js';
export type RegisterVehicle = { tenantId: string; plate: string; brand: string; model: string; category: string; mileageKm: number; soatExpiresAt?: Date; tecnomecanicaExpiresAt?: Date };
export async function registerVehicle(pool: Pool, input: RegisterVehicle) {
  try {
    return await inTenantTransaction(pool, input.tenantId, client => client.query<{ id: string; is_available: boolean }>(
      `INSERT INTO vehicles (tenant_id, plate, brand, model, category, mileage_km, soat_expires_at, tecnomecanica_expires_at, is_available)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8, ($7 IS NULL OR $7 >= current_date) AND ($8 IS NULL OR $8 >= current_date))
       RETURNING id, is_available`,
      [input.tenantId, input.plate.trim().toUpperCase(), input.brand.trim(), input.model.trim(), input.category, input.mileageKm, input.soatExpiresAt ?? null, input.tecnomecanicaExpiresAt ?? null]
    ).then(result => result.rows[0]));
  } catch (error: any) {
    if (error?.code === '23505') throw new DomainError('La placa ya está registrada en este CEA.', 'VEHICLE_PLATE_EXISTS');
    throw error;
  }
}
