import type { Pool } from 'pg';
import { inTenantTransaction } from '../../../infrastructure/database/tenant-transaction.js';
import { DomainError } from '../../../shared/domain/errors.js';
export type RuntStatus = 'VALID' | 'BLOCKED' | 'UNAVAILABLE';
export interface RuntGateway { validate(input: { documentNumber: string; licenseCategory: string }): Promise<RuntStatus>; }
export class UnavailableRuntGateway implements RuntGateway { async validate(): Promise<RuntStatus> { throw new DomainError('El servicio RUNT no está disponible.', 'RUNT_UNAVAILABLE'); } }
export async function validateStudentWithRunt(pool: Pool, gateway: RuntGateway, input: { tenantId: string; studentId: string }) {
  return inTenantTransaction(pool, input.tenantId, async client => {
    const student = await client.query<{ document_number: string; license_category: string }>('SELECT document_number, license_category FROM students WHERE tenant_id=$1 AND id=$2 FOR KEY SHARE', [input.tenantId, input.studentId]);
    if (!student.rowCount) throw new DomainError('El estudiante no existe o no pertenece al CEA.', 'STUDENT_NOT_FOUND');
    const status = await gateway.validate({ documentNumber: student.rows[0].document_number, licenseCategory: student.rows[0].license_category });
    await client.query('UPDATE students SET runt_status=$1 WHERE tenant_id=$2 AND id=$3', [status, input.tenantId, input.studentId]);
    return { studentId: input.studentId, runtStatus: status };
  });
}
