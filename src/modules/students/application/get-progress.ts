import type { Pool } from 'pg';
import { tenantQuery } from '../../../infrastructure/database/tenant-transaction.js';
export async function getStudentProgress(pool: Pool, tenantId: string, studentId: string) {
  const result = await tenantQuery(pool, tenantId, 'SELECT theory_hours AS "theoryHours", practical_hours AS "practicalHours", exams_passed AS "examsPassed" FROM student_progress WHERE tenant_id=$1 AND student_id=$2', [tenantId, studentId]);
  return result.rows[0] ?? { theoryHours: '0', practicalHours: '0', examsPassed: 0 };
}
