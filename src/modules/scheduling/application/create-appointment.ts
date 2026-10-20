import type { Pool } from 'pg';
import { inTenantTransaction } from '../../../infrastructure/database/tenant-transaction.js';
import { DomainError } from '../../../shared/domain/errors.js';

export type CreateAppointment = { tenantId: string; studentId: string; instructorId?: string; vehicleId?: string; kind: 'THEORY' | 'PRACTICAL'; startsAt: Date; endsAt: Date; };
export async function createAppointment(pool: Pool, input: CreateAppointment) {
  try {
    return await inTenantTransaction(pool, input.tenantId, async client => {
      if (input.kind === 'PRACTICAL' && (!input.instructorId || !input.vehicleId)) throw new DomainError('Una clase práctica requiere instructor y vehículo.', 'INVALID_PRACTICAL_RESOURCES');
      const student = await client.query('SELECT id FROM students WHERE id = $1 FOR KEY SHARE', [input.studentId]);
      if (!student.rowCount) throw new DomainError('El estudiante no existe o no pertenece al CEA.', 'STUDENT_NOT_AVAILABLE');
      if (input.kind === 'PRACTICAL') {
        const instructor = await client.query(
          "SELECT id FROM instructors WHERE id = $1 AND is_active AND (credential_expires_at IS NULL OR credential_expires_at >= current_date) FOR KEY SHARE", [input.instructorId]
        );
        if (!instructor.rowCount) throw new DomainError('El instructor no está habilitado.', 'INSTRUCTOR_NOT_AVAILABLE');
        const vehicle = await client.query(
          "SELECT id FROM vehicles WHERE id = $1 AND is_available AND (soat_expires_at IS NULL OR soat_expires_at >= current_date) AND (tecnomecanica_expires_at IS NULL OR tecnomecanica_expires_at >= current_date) FOR KEY SHARE", [input.vehicleId]
        );
        if (!vehicle.rowCount) throw new DomainError('El vehículo no está habilitado.', 'VEHICLE_NOT_AVAILABLE');
      }
      const result = await client.query<{ id: string }>(
        `INSERT INTO appointments (tenant_id, student_id, instructor_id, vehicle_id, kind, starts_at, ends_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
        [input.tenantId, input.studentId, input.instructorId ?? null, input.vehicleId ?? null, input.kind, input.startsAt, input.endsAt]
      );
      return result.rows[0];
    });
  } catch (error: any) {
    if (error?.code === '23P01') throw new DomainError('El estudiante, instructor o vehículo ya tiene una reserva en ese intervalo.', 'SCHEDULE_CONFLICT');
    if (error?.code === '40001') throw new DomainError('La reserva compitió con otra operación. Reintente.', 'CONCURRENT_MODIFICATION');
    throw error;
  }
}
