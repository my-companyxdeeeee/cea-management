import type { Pool } from 'pg';
import { inTenantTransaction } from '../../../infrastructure/database/tenant-transaction.js';
import { DomainError } from '../../../shared/domain/errors.js';
export async function closeAppointment(pool: Pool, input: { tenantId: string; userId: string; appointmentId: string; checkIn: Date; checkOut: Date; verificationMethod: 'DIGITAL' | 'BIOMETRIC'; endingMileageKm?: number }) {
  return inTenantTransaction(pool, input.tenantId, async client => {
    const target = await client.query<{ kind: string; vehicle_id: string | null }>(`SELECT a.kind, a.vehicle_id FROM appointments a JOIN instructors i ON i.tenant_id=a.tenant_id AND i.id=a.instructor_id WHERE a.tenant_id=$1 AND a.id=$2 AND i.user_id=$3 AND a.status='SCHEDULED' FOR UPDATE`, [input.tenantId, input.appointmentId, input.userId]);
    const appointment = target.rows[0];
    if (!appointment) throw new DomainError('La clase no existe, no pertenece al instructor o ya fue cerrada.', 'APPOINTMENT_NOT_AVAILABLE');
    if (appointment.kind === 'PRACTICAL' && input.endingMileageKm === undefined) throw new DomainError('Una práctica requiere kilometraje final.', 'ENDING_MILEAGE_REQUIRED');
    await client.query('INSERT INTO attendance_records (tenant_id, appointment_id, check_in, check_out, verification_method, ending_mileage_km) VALUES ($1,$2,$3,$4,$5,$6)', [input.tenantId, input.appointmentId, input.checkIn, input.checkOut, input.verificationMethod, input.endingMileageKm ?? null]);
    await client.query("UPDATE appointments SET status='COMPLETED' WHERE tenant_id=$1 AND id=$2", [input.tenantId, input.appointmentId]);
    if (appointment.vehicle_id && input.endingMileageKm !== undefined) await client.query('UPDATE vehicles SET mileage_km=$1 WHERE tenant_id=$2 AND id=$3', [input.endingMileageKm, input.tenantId, appointment.vehicle_id]);
    return { appointmentId: input.appointmentId, status: 'COMPLETED' as const };
  });
}
